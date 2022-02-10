import useSWR from 'swr'
import { JsonRpcProvider } from '@ethersproject/providers'
import { POSITIONS } from '@/src/queries/positions'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { positions } from '@/types/subgraph/__generated__/positions'
import { wranglePosition } from '@/src/utils/data/positions'
import { ChainsValues } from '@/src/constants/chains'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

export const fetchPositions = (provider: JsonRpcProvider, appChainId: ChainsValues) =>
  graphqlFetcher<positions>(POSITIONS).then(async ({ positions }) => {
    return Promise.all(positions.map((p) => wranglePosition(p, provider, appChainId)))
  })

export const usePositions = () => {
  const { appChainId, readOnlyAppProvider: provider } = useWeb3Connection()
  const { data } = useSWR(['positions'], () => fetchPositions(provider, appChainId))

  return { positions: data, positionTransactions: [] }
}
