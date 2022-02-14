import { BigNumberToDateOrCurrent } from '../dateTime'
import { JsonRpcProvider } from '@ethersproject/providers'
import { BigNumber } from 'ethers'
import { Collaterals_collaterals as SubgraphCollateral } from '@/types/subgraph/__generated__/collaterals'

import { ChainsValues } from '@/src/constants/chains'

export type Collateral = {
  id: string
  tokenId: string | null
  vaultName: string | null
  symbol: string | null
  underlierSymbol: string | null
  underlierAddress: string | null
  maturity: Date
  address: string | null
  faceValue: BigNumber | null
  vault: { collateralizationRatio: BigNumber; address: string }
}

const wrangleCollateral = async (
  collateral: SubgraphCollateral,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  provider: JsonRpcProvider,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  appChainId: ChainsValues,
): Promise<Collateral> => {
  return {
    ...collateral,
    maturity: BigNumberToDateOrCurrent(collateral.maturity),
    faceValue: BigNumber.from(collateral.faceValue),
    vault: {
      collateralizationRatio: BigNumber.from(collateral.vault?.collateralizationRatio),
      address: collateral.vault?.address ?? '',
    },
  }
}
export { wrangleCollateral }
