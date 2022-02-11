import contractCall from '../contractCall'
import BigNumber from 'bignumber.js'
import { JsonRpcProvider } from '@ethersproject/providers'
import { positions_positions as SubgraphPosition } from '@/types/subgraph/__generated__/positions'

import { Maybe } from '@/types/utils'
import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { Collybus } from '@/types/typechain'
import { ZERO_ADDRESS } from '@/src/constants/misc'

type TokenData = {
  symbol: string
  address: string
  decimals: number
}

export type Position = {
  id: string
  protocol: string
  maturity: Date
  collateral: TokenData
  underlier: TokenData
  totalCollateral: BigNumber
  totalNormalDebt: BigNumber
  vaultCollateralizationRatio: Maybe<BigNumber>
  currentValue: BigNumber
  faceValue: BigNumber
  healthFactor: BigNumber
  isAtRisk: boolean
  discount: BigNumber
}

const wranglePosition = async (
  position: SubgraphPosition,
  provider: JsonRpcProvider,
  appChainId: ChainsValues,
): Promise<Position> => {
  const { id, vaultName: protocol } = position
  const vaultCollateralizationRatio = BigNumber.from(
    position.vault?.collateralizationRatio ?? 0,
  ) as BigNumber
  const totalCollateral = BigNumber.from(position.totalCollateral) as BigNumber
  const totalNormalDebt = BigNumber.from(position.totalNormalDebt) as BigNumber
  const discount = BigNumber.from(position.vault?.maxDiscount ?? 0) as BigNumber

  const {
    abi: collybusAbi,
    address: { [appChainId]: collybusAddress },
  } = contracts.COLLYBUS

  // TODO Move to const [ ... ] = await Promise.all([..., ..., ...])
  // TODO FIXME for no-ERC20
  const { abi: erc20Abi } = contracts.ERC_20

  const maturity = new Date(position.maturity ? +position.maturity * 1000 : Date.now())

  const currentValue =
    position?.collateral?.underlierAddress &&
    position?.vault?.address &&
    position.maturity &&
    position?.collateral?.underlierAddress !== ZERO_ADDRESS
      ? await contractCall<Collybus, 'read'>(collybusAddress, collybusAbi, provider, 'read', [
          position.vault.address,
          position.collateral.underlierAddress,
          0, // FIXME Check protocol if is not an ERC20?
          position.maturity,
          false,
        ])
      : null

  const faceValue =
    position.vault?.address && position.collateral?.underlierAddress && position.maturity
      ? await contractCall<Collybus, 'read'>(collybusAddress, collybusAbi, provider, 'read', [
          position.vault?.address,
          position.collateral?.underlierAddress,
          0, // FIXME Check protocol if is not an ERC20?
          position.maturity,
          true,
        ])
      : null

  const collateralDecimals =
    (position?.collateral?.address &&
      position?.collateral?.address !== ZERO_ADDRESS &&
      (await contractCall(position.collateral?.address, erc20Abi, provider, 'decimals', null))) ||
    18

  const underlierDecimals =
    (position?.collateral?.underlierAddress &&
      position?.collateral?.underlierAddress !== ZERO_ADDRESS &&
      (await contractCall(
        position.collateral?.underlierAddress,
        erc20Abi,
        provider,
        'decimals',
        null,
      ))) ||
    18

  const healthFactor =
    currentValue && !totalNormalDebt?.isZero() && !totalCollateral?.isZero()
      ? currentValue.mul(totalCollateral.toFixed()).div(totalNormalDebt.toFixed()).toNumber()
      : 1

  // FIXME
  const isAtRisk = vaultCollateralizationRatio.gte(healthFactor)

  // TODO Borrowing rate
  return {
    id,
    protocol: protocol ?? '',
    vaultCollateralizationRatio,
    totalCollateral,
    totalNormalDebt,
    currentValue: BigNumber.from(currentValue?.toString() ?? 0) as BigNumber,
    faceValue: BigNumber.from(faceValue?.toString() ?? 0) as BigNumber,
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
    healthFactor: BigNumber.from(healthFactor),
    isAtRisk,
    discount,
  }
}
export { wranglePosition }
