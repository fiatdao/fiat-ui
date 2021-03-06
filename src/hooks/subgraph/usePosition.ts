import { Maybe } from '@/types/utils'
import { Positions, PositionsVariables } from '@/types/subgraph/__generated__/Positions'
import { ChainsValues } from '@/src/constants/chains'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Position, wranglePosition } from '@/src/utils/data/positions'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { POSITIONS } from '@/src/queries/positions'
import { JsonRpcProvider } from '@ethersproject/providers'
import useSWR, { KeyedMutator } from 'swr'

// FIXME Use fragment or find a way to unify queries
export const fetchPosition = (
  positionId: string,
  provider: JsonRpcProvider,
  appChainId: ChainsValues,
  userAddress: Maybe<string>,
) => {
  return graphqlFetcher<Positions, PositionsVariables>(appChainId, POSITIONS, {
    where: {
      id: positionId.toLowerCase(),
    },
  }).then(({ positions }) => {
    const [position] = positions

    if (position) {
      return wranglePosition(position, provider, appChainId, userAddress ?? '')
    }

    throw `Position with id ${positionId} not found`
  })
}

type usePosition = {
  position?: Position
  refetch: KeyedMutator<Position>
  error: any
}

export const usePosition = (positionId: string): usePosition => {
  const { address: userAddress, appChainId, readOnlyAppProvider: provider } = useWeb3Connection()

  const { data, error, mutate } = useSWR(['position-by-id', positionId, appChainId, provider], () =>
    fetchPosition(positionId, provider, appChainId, userAddress),
  )

  return { position: data, refetch: mutate, error }
}

export type RefetchPositionById = ReturnType<typeof usePosition>['refetch']
