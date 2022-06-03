import { getFaceValue } from '../getFaceValue'
import { getVirtualRate } from '../getVirtualRate'
import { getCollateralMetadata } from '@/src/constants/bondTokens'
import contractCall from '@/src/utils/contractCall'
import { stringToDateOrCurrent } from '@/src/utils/dateTime'
import { getCurrentValue } from '@/src/utils/getCurrentValue'
import { getHumanValue } from '@/src/web3/utils'
import { Positions_positions as SubgraphPosition } from '@/types/subgraph/__generated__/Positions'

import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import {
  INFINITE_BIG_NUMBER,
  INFINITE_HEALTH_FACTOR_NUMBER,
  MIN_EPSILON_OFFSET,
  ONE_BIG_NUMBER,
  VIRTUAL_RATE_MAX_SLIPPAGE,
  WAD_DECIMALS,
  ZERO_BIG_NUMBER,
} from '@/src/constants/misc'
import { TokenData } from '@/types/token'
import { ERC20 } from '@/types/typechain'
import { Maybe } from '@/types/utils'
import { differenceInDays } from 'date-fns'
import BigNumber from 'bignumber.js'
import { JsonRpcProvider } from '@ethersproject/providers'

export type Position = {
  id: string
  tokenId: string
  asset: string
  owner: string
  protocol: string
  symbol: string
  protocolAddress: string
  maturity: Date
  collateral: TokenData
  underlier: TokenData
  totalCollateral: BigNumber
  totalNormalDebt: BigNumber
  totalDebt: BigNumber
  vaultCollateralizationRatio: BigNumber
  collateralValue: BigNumber
  faceValue: BigNumber
  healthFactor: BigNumber
  isAtRisk: boolean
  interestPerSecond: BigNumber
  currentValue: BigNumber
  userAddress: string
  debtFloor: BigNumber
  vaultName: string
  vaultType: string
  virtualRate: BigNumber
  url?: string
}

const readValue = async (
  position: SubgraphPosition,
  isFaceValue: boolean,
  appChainId: ChainsValues,
  provider: JsonRpcProvider,
): Promise<BigNumber> => {
  return getCurrentValue(
    provider,
    appChainId,
    position?.collateralType?.tokenId ?? 0,
    position?.vault?.address || null,
    isFaceValue,
  )
}

const _getCurrentValue = (
  position: SubgraphPosition,
  appChainId: ChainsValues,
  provider: JsonRpcProvider,
): Promise<BigNumber> => {
  return readValue(position, false, appChainId, provider)
}

const getDecimals = async (
  address: string | null | undefined,
  provider: JsonRpcProvider,
): Promise<number> => {
  if (!address) {
    return 18
  }

  const decimals = await contractCall<ERC20, 'decimals'>(
    address,
    contracts.ERC_20.abi,
    provider,
    'decimals',
    null,
  )

  return decimals ?? 18
}

export const getDateState = (maturityDate: Date) => {
  const now = new Date()
  const diff = differenceInDays(maturityDate, now)

  return diff <= 0 ? 'danger' : diff <= 7 ? 'warning' : 'ok'
}

// @TODO: we need to use debt instead of normalDebt to calculate HF
//        replace hardcoded value for Publican virtualRate value
//        https://github.com/fiatdao/fiat-ui/issues/292
// normalDebt = debt / (virtualRate*slippageMargin)
const calculateNormalDebt = (debt: BigNumber, virtualRate: BigNumber) => {
  return debt.div(virtualRate.times(VIRTUAL_RATE_MAX_SLIPPAGE))
}

// debt = normalDebt * (virtualRate*slippageMargin)
const calculateDebt = (normalDebt: BigNumber, virtualRate: BigNumber) => {
  return normalDebt.times(virtualRate.times(VIRTUAL_RATE_MAX_SLIPPAGE))
}

// Arguments should have WAD percision
// maxBorrow = collateral * collateralPrice / ( collateralizationRatio * maxSlippage ) - currentDebt
const calculateMaxBorrow = (
  totalCollateral: BigNumber,
  collateralValue: BigNumber,
  collateralizationRatio: BigNumber,
  totalDebt: BigNumber,
): BigNumber => {
  const collateralWithMults = totalCollateral
    .times(collateralValue)
    .div(collateralizationRatio)
    .times(VIRTUAL_RATE_MAX_SLIPPAGE)
  const borrowAmount = collateralWithMults.minus(totalDebt)

  let result = ZERO_BIG_NUMBER
  if (borrowAmount.isPositive()) {
    result = borrowAmount
  }

  return getHumanValue(result, WAD_DECIMALS)
}

// @TODO: healthFactor = totalCollateral*collateralValue/totalFIAT/collateralizationRatio
// totalFIAT = debt = normalDebt * (virtualRate*slippageMargin)
const calculateHealthFactor = (
  currentValue: BigNumber | Maybe<BigNumber> | undefined, // collateralValue
  collateralizationRatio: BigNumber | Maybe<BigNumber> | undefined,
  collateral: BigNumber | undefined,
  debt: BigNumber | undefined,
): {
  healthFactor: BigNumber // NonHumanBigNumber
  isAtRisk: boolean
} => {
  let isAtRisk = false
  let healthFactor = ZERO_BIG_NUMBER
  if (!debt || debt?.isZero() || debt.lt(MIN_EPSILON_OFFSET)) {
    healthFactor = INFINITE_BIG_NUMBER
    return {
      healthFactor,
      isAtRisk,
    }
  } else {
    if (currentValue && collateral && !collateral?.isZero() && collateralizationRatio) {
      healthFactor = collateral.times(currentValue).div(debt).div(collateralizationRatio)

      if (healthFactor.isGreaterThan(INFINITE_HEALTH_FACTOR_NUMBER)) {
        healthFactor = INFINITE_BIG_NUMBER
      }
      isAtRisk = getHumanValue(collateralizationRatio, WAD_DECIMALS).gte(healthFactor)
    }
  }
  return {
    healthFactor,
    isAtRisk,
  }
}

const isValidHealthFactor = (healthFactor?: BigNumber) => {
  return healthFactor && healthFactor.isFinite() && healthFactor.isPositive()
}

const wranglePosition = async (
  position: SubgraphPosition,
  provider: JsonRpcProvider,
  appChainId: ChainsValues,
  userAddress: string,
): Promise<Position> => {
  const vaultCollateralizationRatio =
    BigNumber.from(position.vault?.collateralizationRatio) ?? ONE_BIG_NUMBER
  const totalCollateral = BigNumber.from(position.collateral) ?? ZERO_BIG_NUMBER
  const totalNormalDebt = BigNumber.from(position.normalDebt) ?? ZERO_BIG_NUMBER
  const interestPerSecond = BigNumber.from(position.vault?.interestPerSecond) ?? ZERO_BIG_NUMBER
  const debtFloor = BigNumber.from(position.vault?.debtFloor) ?? ZERO_BIG_NUMBER
  const maturity = stringToDateOrCurrent(position.maturity)
  const vaultName = position.vaultName ?? ''
  const vaultType = position.vault?.type ?? ''

  const [currentValue, faceValue, collateralDecimals, underlierDecimals, virtualRate] =
    await Promise.all([
      _getCurrentValue(position, appChainId, provider),
      getFaceValue(provider, position.collateralType?.tokenId ?? 0, position.vault?.address ?? ''),
      getDecimals(position.collateralType?.address, provider), // collateral is an ERC20 token
      getDecimals(position.collateralType?.underlierAddress, provider),
      getVirtualRate(appChainId, provider, position.vault?.address ?? undefined),
    ])

  // @TODO: totalDebt = normalDebt * RATES
  const totalDebt = calculateDebt(totalNormalDebt, virtualRate)
  const { healthFactor, isAtRisk } = calculateHealthFactor(
    currentValue,
    vaultCollateralizationRatio,
    totalCollateral,
    totalDebt,
  )

  const {
    asset = '',
    protocol = '',
    symbol = '',
    urls,
  } = getCollateralMetadata(appChainId, {
    vaultAddress: position.vault?.address,
    tokenId: position.collateralType?.tokenId,
  }) ?? {}

  // TODO Interest rate
  return {
    id: position.id,
    tokenId: position.collateralType?.tokenId ?? '',
    protocolAddress: position.vault?.address ?? '',
    protocol,
    symbol,
    asset,
    vaultCollateralizationRatio,
    totalCollateral,
    totalNormalDebt,
    totalDebt,
    currentValue,
    vaultType,
    owner: position.owner,
    collateralValue: getHumanValue(currentValue.times(totalCollateral), WAD_DECIMALS),
    faceValue,
    maturity,
    collateral: {
      symbol: position?.collateralType?.symbol ?? '',
      address: position?.collateralType?.address ?? '',
      decimals: collateralDecimals,
    },
    underlier: {
      symbol: position?.collateralType?.underlierSymbol ?? '',
      address: position?.collateralType?.underlierAddress ?? '',
      decimals: underlierDecimals,
    },
    healthFactor,
    isAtRisk,
    interestPerSecond,
    userAddress,
    debtFloor,
    vaultName,
    virtualRate,
    url: urls?.asset,
  }
}

export {
  wranglePosition,
  calculateHealthFactor,
  calculateMaxBorrow,
  calculateNormalDebt,
  calculateDebt,
  isValidHealthFactor,
}
