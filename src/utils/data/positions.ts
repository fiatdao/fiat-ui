import contractCall from '../contractCall'
import BigNumber from 'bignumber.js'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Positions_positions } from '@/types/subgraph/__generated__/Positions'
import { getHumanValue } from '@/src/web3/utils'

import { Maybe, TokenData } from '@/types/utils'
import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { Collybus, ERC20 } from '@/types/typechain'
import { ZERO_ADDRESS, ZERO_BIG_NUMBER } from '@/src/constants/misc'

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
}

const wranglePosition = async (
  position: Positions_positions,
  provider: JsonRpcProvider,
  appChainId: ChainsValues,
): Promise<Position> => {
  const { id, vaultName: protocol } = position
  const vaultCollateralizationRatio = BigNumber.from(
    position.vault?.collateralizationRatio ?? 0,
  ) as BigNumber
  const totalCollateral = getHumanValue(BigNumber.from(position.totalCollateral) as BigNumber, 18)
  const totalNormalDebt = getHumanValue(BigNumber.from(position.totalNormalDebt) as BigNumber, 18)
  const maturity = new Date(position.maturity ? +position.maturity * 1000 : Date.now())

  let collateralValue = null
  if (
    position?.collateral?.underlierAddress &&
    position?.vault?.address &&
    position.maturity &&
    position?.collateral?.underlierAddress !== ZERO_ADDRESS
  ) {
    collateralValue = await contractCall<Collybus, 'read'>(
      contracts.COLLYBUS.address[appChainId],
      contracts.COLLYBUS.abi,
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
      contracts.COLLYBUS.address[appChainId],
      contracts.COLLYBUS.abi,
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
      contracts.ERC_20.abi,
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
      contracts.ERC_20.abi,
      provider,
      'decimals',
      null,
    )

    if (_underlierDecimals !== null) {
      underlierDecimals = _underlierDecimals
    }
  }

  let healthFactor = ZERO_BIG_NUMBER
  if (collateralValue && !totalNormalDebt?.isZero() && !totalCollateral?.isZero()) {
    const s = totalCollateral.toFixed()
    const s1 = totalNormalDebt.toFixed()
    healthFactor = (BigNumber.from(collateralValue.toString()) as BigNumber).times(s).div(s1)
  }

  // FIXME
  const isAtRisk = vaultCollateralizationRatio.gte(healthFactor)

  // TODO Borrowing rate
  return {
    id,
    protocol: protocol ?? '',
    vaultCollateralizationRatio,
    totalCollateral,
    totalNormalDebt,
    collateralValue: getHumanValue(
      BigNumber.from(collateralValue?.toString() ?? 0) as BigNumber,
      18,
    ),
    faceValue: getHumanValue(BigNumber.from(faceValue?.toString() ?? 0) as BigNumber, 18),
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
