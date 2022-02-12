import useSWR from 'swr'
import { JsonRpcProvider } from '@ethersproject/providers'
import { POSITIONS } from '@/src/queries/positions'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { Positions, PositionsVariables } from '@/types/subgraph/__generated__/positions'
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
    console.log({ id, userAddress, vaultName })
    return Promise.all(positions.map((p) => wranglePosition(p, provider, appChainId)))
  })

export const usePositions = (id?: string, address?: string, protocol?: string) => {
  console.log({ id, address, protocol })

  const { appChainId, readOnlyAppProvider: provider } = useWeb3Connection()
  // TODO Change key depending on parameters
  const { data } = useSWR(['positions', id, address, protocol], () =>
    fetchPositions({ id, address, protocol, provider, appChainId }),
  )

  return { positions: data, positionTransactions: [] }
}
