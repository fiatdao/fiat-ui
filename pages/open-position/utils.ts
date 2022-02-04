import { BigNumber } from 'ethers'
import { ChainsValues } from '@/src/constants/chains'
import callCollybus from '@/src/utils/callCollybus'
import { collaterals } from '@/types/subgraph/__generated__/collaterals'

type Collateral = {
  id: string
  protocol: string
  asset: string
  underlying: string
  maturity: Date
  faceValue: string
  currentValue: string
  maxLTV: string
}

export const transformCollaterals = (
  cols: collaterals,
  provider: any,
  appChainId: ChainsValues,
): Collateral[] => {
  return cols.collaterals.map((collateral) => {
    console.log(collateral)
    const vaultAddress = collateral.vault?.address
    const underlierAddress = collateral.underlierAddress
    const tokenId = collateral.tokenId
    const maturity = BigNumber.from(Math.round(Date.now() / 1000))
    callCollybus(provider, appChainId, 'read', [
      vaultAddress,
      underlierAddress,
      tokenId,
      maturity,
      false,
    ])
    return {
      id: collateral.id,
      protocol: collateral.vault?.name,
      asset: collateral.symbol,
      underlying: collateral.underlierSymbol,
      maturity: new Date(collateral.maturity * 1000),
      faceValue: collateral.faceValue,
      currentValue: 'currentValue',
      maxLTV: collateral.vault?.collaterizationRatio,
    } as Collateral
  })
}
