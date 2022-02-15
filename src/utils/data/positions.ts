import contractCall from '../contractCall'
import { BigNumberToDateOrCurrent } from '../dateTime'
import BigNumber from 'bignumber.js'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Positions_positions as SubgraphPosition } from '@/types/subgraph/__generated__/Positions'

import { Maybe, TokenData } from '@/types/utils'
import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { Collybus, ERC20 } from '@/types/typechain'
import { ZERO_ADDRESS } from '@/src/constants/misc'

export type Position = {
  id: string
  protocol: string
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

  const maturity = BigNumberToDateOrCurrent(position.maturity)

  let collateralValue = null
  if (
    position?.collateral?.underlierAddress &&
    position?.vault?.address &&
    position.maturity &&
    position?.collateral?.underlierAddress !== ZERO_ADDRESS
  ) {
    collateralValue = await contractCall<Collybus, 'read'>(
      collybusAddress,
      collybusAbi,
      provider,
      'read',
      [
        position.vault.address,
        position.collateral.underlierAddress,
        0, // FIXME Check protocol if is not an ERC20?
        position.maturity,
        false,
      ],
    )
  }

  let faceValue = null
  if (position.vault?.address && position.collateral?.underlierAddress && position.maturity) {
    faceValue = await contractCall<Collybus, 'read'>(
      collybusAddress,
      collybusAbi,
      provider,
      'read',
      [
        position.vault?.address,
        position.collateral?.underlierAddress,
        0, // FIXME Check protocol if is not an ERC20?
        position.maturity,
        true,
      ],
    )
  }

  let collateralDecimals = 18
  if (position?.collateral?.address && position?.collateral?.address !== ZERO_ADDRESS) {
    const _collateralDecimals = await contractCall<ERC20, 'decimals'>(
      position.collateral?.address,
      erc20Abi,
      provider,
      'decimals',
      null,
    )

    if (_collateralDecimals !== null) {
      collateralDecimals = _collateralDecimals
    }
  }

  let underlierDecimals = 18
  if (
    position?.collateral?.underlierAddress &&
    position?.collateral?.underlierAddress !== ZERO_ADDRESS
  ) {
    const _underlierDecimals = await contractCall<ERC20, 'decimals'>(
      position.collateral?.underlierAddress,
      erc20Abi,
      provider,
      'decimals',
      null,
    )

    if (_underlierDecimals !== null) {
      underlierDecimals = _underlierDecimals
    }
  }

  const healthFactor =
    collateralValue && !totalNormalDebt?.isZero() && !totalCollateral?.isZero()
      ? collateralValue.mul(totalCollateral.toFixed()).div(totalNormalDebt.toFixed()).toNumber()
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
    collateralValue: BigNumber.from(collateralValue?.toString() ?? 0) as BigNumber,
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
