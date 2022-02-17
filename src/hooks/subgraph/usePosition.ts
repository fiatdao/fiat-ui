import { JsonRpcProvider } from '@ethersproject/providers'
import useSWR from 'swr'
import { Positions, PositionsVariables } from '@/types/subgraph/__generated__/Positions'
import { ChainsValues } from '@/src/constants/chains'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { wranglePosition } from '@/src/utils/data/positions'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { POSITIONS } from '@/src/queries/positions'

// FIXME Use fragment or find a way to unify queries
export const fetchPosition = async (
  positionId: string,
  provider: JsonRpcProvider,
  appChainId: ChainsValues,
) => {
  return graphqlFetcher<Positions, PositionsVariables>(POSITIONS, {
    where: {
      id: positionId,
    },
  }).then(({ positions }) => {
    const [position] = positions

    if (position) {
      return wranglePosition(position, provider, appChainId)
    }
  })
}
export const usePosition = (positionId: string) => {
  const { appChainId, readOnlyAppProvider: provider } = useWeb3Connection()
  const { data, error, mutate } = useSWR(['position-by-id', positionId, appChainId], () =>
    fetchPosition(positionId, provider, appChainId),
  )
  return { position: data, refetch: mutate, error }
}

export type RefetchPositionById = ReturnType<typeof usePosition>['refetch']
