import contractCall from '../contractCall'
import { BigNumberToDateOrCurrent } from '../dateTime'
import BigNumber from 'bignumber.js'
import { JsonRpcProvider } from '@ethersproject/providers'
import { BigNumber as BigNumberEthers } from 'ethers'
import { getHumanValue } from '@/src/web3/utils'
import { Positions_positions as SubgraphPosition } from '@/types/subgraph/__generated__/Positions'

import { Maybe, TokenData } from '@/types/utils'
import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { Collybus, ERC20 } from '@/types/typechain'
import { ZERO_ADDRESS, ZERO_BIG_NUMBER } from '@/src/constants/misc'

export type Position = {
  id: string
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
}

const readValue = async (
  position: SubgraphPosition,
  net: boolean,
  appChainId: ChainsValues,
  provider: JsonRpcProvider,
): Promise<BigNumber> => {
  const {
    abi: collybusAbi,
    address: { [appChainId]: collybusAddress },
  } = contracts.COLLYBUS
  if (
    position?.collateral?.underlierAddress &&
    position?.vault?.address &&
    position.maturity &&
    position?.collateral?.underlierAddress !== ZERO_ADDRESS
  ) {
    try {
      const readResult = (await contractCall<Collybus, 'read'>(
        collybusAddress,
        collybusAbi,
        provider,
        'read',
        [
          position.vault.address,
          position.collateral.underlierAddress,
          0, // FIXME Check protocol if is not an ERC20?
          position.maturity,
          net,
        ],
      )) as BigNumberEthers
      return new BigNumber(readResult.toString())
    } catch (err) {
      return Promise.resolve(ZERO_BIG_NUMBER)
    }
  }
  return Promise.resolve(ZERO_BIG_NUMBER)
}

const getCurrentValue = (
  position: SubgraphPosition,
  appChainId: ChainsValues,
  provider: JsonRpcProvider,
): Promise<BigNumber> => {
  return readValue(position, false, appChainId, provider)
}

const getFaceValue = (
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

const wranglePosition = async (
  position: SubgraphPosition,
  provider: JsonRpcProvider,
  appChainId: ChainsValues,
): Promise<Position> => {
  const { id, vaultName: protocol } = position
  // we use 18 decimals, as values stored are stored in WAD in the FIAT protocol
  const vaultCollateralizationRatio = getHumanValue(
    BigNumber.from(position.vault?.collateralizationRatio ?? 1e18) as BigNumber,
    18,
  )
  const totalCollateral = BigNumber.from(position.totalCollateral) ?? ZERO_BIG_NUMBER
  const totalNormalDebt = BigNumber.from(position.totalNormalDebt) ?? ZERO_BIG_NUMBER
  const maturity = BigNumberToDateOrCurrent(position.maturity)

  const [currentValue, faceValue, collateralDecimals, underlierDecimals] = await Promise.all([
    getCurrentValue(position, appChainId, provider),
    getFaceValue(position, appChainId, provider),
    getDecimals(position.collateral?.address, provider), // collateral is an ERC20 token
    getDecimals(position.collateral?.underlierAddress, provider),
  ])

  let isAtRisk = false
  let healthFactor = ZERO_BIG_NUMBER
  if (currentValue && !totalNormalDebt?.isZero() && !totalCollateral?.isZero()) {
    healthFactor = new BigNumber(
      currentValue.times(totalCollateral.toFixed()).div(totalNormalDebt.toFixed()).toNumber(),
    )
    isAtRisk = vaultCollateralizationRatio.gte(healthFactor)
  }

  // TODO Borrowing rate
  return {
    id,
    protocolAddress: position.vault?.address ?? '',
    protocol: protocol ?? '',
    vaultCollateralizationRatio,
    totalCollateral,
    totalNormalDebt,
    collateralValue: currentValue,
    faceValue,
    maturity,
    collateral: {
      symbol: position?.collateral?.symbol ?? '',
      address: position?.collateral?.address ?? '',
      decimals: collateralDecimals,
    },
    underlier: {
      symbol: position?.collateral?.underlierSymbol ?? '',
      address: position?.collateral?.underlierAddress ?? '',
      decimals: underlierDecimals,
    },
    healthFactor,
    isAtRisk,
  }
}
export { wranglePosition }
