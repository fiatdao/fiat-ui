import contractCall from '../contractCall'
import { BigNumberToDateOrCurrent } from '../dateTime'
import BigNumber from 'bignumber.js'
import { JsonRpcProvider } from '@ethersproject/providers'
import { getCurrentValue } from '@/src/utils/getCurrentValue'
import { getHumanValue } from '@/src/web3/utils'
import { Positions_positions as SubgraphPosition } from '@/types/subgraph/__generated__/Positions'

import { Maybe } from '@/types/utils'
import { TokenData } from '@/types/token'
import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { ERC20 } from '@/types/typechain'
import { INFINITE_HEALTH_FACTOR_NUMBER, WAD_DECIMALS, ZERO_BIG_NUMBER } from '@/src/constants/misc'

export type Position = {
  id: string
  tokenId: string
  protocol: string
  protocolAddress: string
  maturity: Date
  collateral: TokenData
  underlier: TokenData
  totalCollateral: BigNumber
  totalNormalDebt: BigNumber
  vaultCollateralizationRatio: Maybe<BigNumber>
  collateralValue: BigNumber
  faceValue: BigNumber
  healthFactor: BigNumber
  isAtRisk: boolean
  interestPerSecond: BigNumber
  currentValue: BigNumber
}

// TODO pass tokenId depends on protocol

const readValue = async (
  position: SubgraphPosition,
  isFaceValue: boolean,
  appChainId: ChainsValues,
  provider: JsonRpcProvider,
): Promise<BigNumber> => {
  return getCurrentValue(provider, appChainId, 0, position?.vault?.address || null, isFaceValue)
}

const _getCurrentValue = (
  position: SubgraphPosition,
  appChainId: ChainsValues,
  provider: JsonRpcProvider,
): Promise<BigNumber> => {
  return readValue(position, false, appChainId, provider)
}

const _getFaceValue = (
  position: SubgraphPosition,
  appChainId: ChainsValues,
  provider: JsonRpcProvider,
): Promise<BigNumber> => {
  return readValue(position, true, appChainId, provider)
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

const calculateHealthFactor = (
  currentValue: BigNumber | undefined,
  collateral: BigNumber | undefined,
  normalDebt: BigNumber | undefined,
  collateralizationRatio: BigNumber,
): {
  healthFactor: BigNumber
  isAtRisk: boolean
} => {
  let isAtRisk = false
  let healthFactor = ZERO_BIG_NUMBER
  if (currentValue && collateral && !collateral?.isZero() && normalDebt && collateralizationRatio) {
    if (normalDebt?.isZero()) {
      healthFactor = new BigNumber(Number.POSITIVE_INFINITY)
    } else {
      healthFactor = new BigNumber(
        currentValue
          .times(collateral.toFixed())
          .div(normalDebt.toFixed())
          .div(collateralizationRatio)
          .toNumber(),
      )
      isAtRisk = collateralizationRatio.gte(healthFactor)
    }
    if (healthFactor.isGreaterThan(INFINITE_HEALTH_FACTOR_NUMBER)) {
      healthFactor = new BigNumber(Number.POSITIVE_INFINITY)
    }
  }
  return {
    healthFactor,
    isAtRisk,
  }
}

const wranglePosition = async (
  position: SubgraphPosition,
  provider: JsonRpcProvider,
  appChainId: ChainsValues,
): Promise<Position> => {
  const { id, vaultName: protocol } = position
  // we use 18 decimals, as values stored are stored in WAD in the FIAT protocol
  const vaultCollateralizationRatio = getHumanValue(
    BigNumber.from(position.vault?.collateralizationRatio ?? 1e18) as BigNumber,
    WAD_DECIMALS,
  )
  const totalCollateral = BigNumber.from(position.totalCollateral) ?? ZERO_BIG_NUMBER
  const totalNormalDebt = BigNumber.from(position.totalNormalDebt) ?? ZERO_BIG_NUMBER
  const interestPerSecond = BigNumber.from(position.vault?.interestPerSecond) ?? ZERO_BIG_NUMBER
  const maturity = BigNumberToDateOrCurrent(position.maturity)

  const [currentValue, faceValue, collateralDecimals, underlierDecimals] = await Promise.all([
    _getCurrentValue(position, appChainId, provider),
    _getFaceValue(position, appChainId, provider),
    getDecimals(position.collateralType?.address, provider), // collateral is an ERC20 token
    getDecimals(position.collateralType?.underlierAddress, provider),
  ])

  const { healthFactor, isAtRisk } = calculateHealthFactor(
    currentValue,
    totalCollateral,
    totalNormalDebt,
    vaultCollateralizationRatio,
  )

  // TODO Interest rate
  return {
    id,
    tokenId: position.collateralType?.tokenId ?? '',
    protocolAddress: position.vault?.address ?? '',
    protocol: protocol ?? '',
    vaultCollateralizationRatio,
    totalCollateral,
    totalNormalDebt,
    currentValue,
    collateralValue: currentValue.times(totalCollateral),
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
  }
}
export { wranglePosition, calculateHealthFactor }
