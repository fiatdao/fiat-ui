import useSWR from 'swr'
import { JsonRpcProvider } from '@ethersproject/providers'
import { positionByIdVariables } from '@/types/subgraph/__generated__/positionById'
import { POSITION_BY_ID } from '@/src/queries/position'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { wranglePosition } from '@/src/utils/data/positions'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { ChainsValues } from '@/src/constants/chains'
import { Positions } from '@/types/subgraph/__generated__/Positions'

// FIXME Use fragment or find a way to unify queries
export const fetchPosition = (
  positionId: string,
  provider: JsonRpcProvider,
  appChainId: ChainsValues,
) =>
  graphqlFetcher<Positions, positionByIdVariables>(POSITION_BY_ID, {
    id: positionId,
  }).then(({ positions }) => {
    if (positions) return wranglePosition(positions[0], provider, appChainId)
  })

export const usePosition = (positionId: string) => {
  const { appChainId, readOnlyAppProvider: provider } = useWeb3Connection()
  const { data, mutate } = useSWR(['position-by-id'], () =>
    fetchPosition(positionId, provider, appChainId),
  )

  return { position: data, refetch: mutate }
}

export type RefetchPositionById = ReturnType<typeof usePosition>['refetch']
