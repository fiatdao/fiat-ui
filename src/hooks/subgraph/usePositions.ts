import useSWR from 'swr'
import { JsonRpcProvider } from '@ethersproject/providers'
import { POSITIONS } from '@/src/queries/positions'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { Positions, PositionsVariables } from '@/types/subgraph/__generated__/Positions'
import { wranglePosition } from '@/src/utils/data/positions'
import { ChainsValues } from '@/src/constants/chains'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

// TODO Import readonly provider from singleton
export const fetchPositions = ({
  address: userAddress,
  appChainId,
  id,
  protocol: vaultName,
  provider,
}: {
  id?: string
  address?: string
  protocol?: string
  provider: JsonRpcProvider
  appChainId: ChainsValues
}) =>
  graphqlFetcher<Positions, PositionsVariables>(POSITIONS, {
    where: { id, userAddress, vaultName },
  }).then(async ({ positions }) => {
    return Promise.all(positions.map((p) => wranglePosition(p, provider, appChainId)))
  })

export const usePositions = (id?: string, address?: string, protocol?: string) => {
  const { appChainId, readOnlyAppProvider: provider } = useWeb3Connection()
  const { data, error, mutate } = useSWR(['positions', id, address, protocol], () =>
    fetchPositions({ id, address, protocol, provider, appChainId }),
  )

  // TODO Remove positionTransactions from here
  return { positions: data, error, refetch: mutate, loading: !error && !data }
}
