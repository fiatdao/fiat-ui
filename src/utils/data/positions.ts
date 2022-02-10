import contractCall from '../contractCall'
import { BigNumber } from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers'
import { positions_positions as SubgraphPosition } from '@/types/subgraph/__generated__/positions'

import { Maybe } from '@/types/utils'
import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { Collybus } from '@/types/typechain'
import { ZERO_ADDRESS, ZERO_BN } from '@/src/constants/misc'

export type Position = {
  id: string
  protocol: string
  maturity: Date
  collateral: {
    symbol: string
    address: string
    decimals: number
  }
  underlier: {
    symbol: string
    address: string
    decimals: number
  }
  totalCollateral: BigNumber
  totalNormalDebt: BigNumber
  vaultCollateralizationRatio: Maybe<BigNumber>
  currentValue: BigNumber
  faceValue: BigNumber
  healthFactor: number
  isAtRisk: boolean
  discount: BigNumber
}

const wranglePosition = async (
  position: SubgraphPosition,
  provider: JsonRpcProvider,
  appChainId: ChainsValues,
): Promise<Position> => {
  const { id, vaultName: protocol } = position
  const vaultCollateralizationRatio = position.vault?.collateralizationRatio
    ? BigNumber.from(position.vault.collateralizationRatio)
    : ZERO_BN
  const totalCollateral = BigNumber.from(position.totalCollateral)
  const totalNormalDebt = BigNumber.from(position.totalNormalDebt)
  const discount = position.vault ? BigNumber.from(position.vault.maxDiscount) : ZERO_BN

  const {
    abi: collybusAbi,
    address: { [appChainId]: collybusAddress },
  } = contracts.COLLYBUS

  // TODO Move to const [ ... ] = await Promise.all([..., ..., ...])
  // TODO FIXME for no-ERC20
  const { abi: erc20Abi } = contracts.ERC_20

  const maturityString = position.maturity
    ? BigNumber.from(position.maturity).mul(1000).toNumber()
    : Date.now()
  const maturity = new Date(maturityString)

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
    position?.collateral?.address && position?.collateral?.address !== ZERO_ADDRESS
      ? await contractCall(position.collateral?.address, erc20Abi, provider, 'decimals', null)
      : 18

  const underlierDecimals =
    position?.collateral?.underlierAddress &&
    position?.collateral?.underlierAddress !== ZERO_ADDRESS
      ? await contractCall(
          position.collateral?.underlierAddress,
          erc20Abi,
          provider,
          'decimals',
          null,
        )
      : 18

  const healthFactor =
    currentValue && !totalNormalDebt.isZero && !totalCollateral.isZero
      ? currentValue.mul(totalCollateral).div(totalNormalDebt).toNumber()
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
    currentValue: currentValue ?? ZERO_BN,
    faceValue: faceValue ?? ZERO_BN,
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
    discount,
  }
}
export { wranglePosition }
