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
  appChainId,
  id,
  protocol: vaultName,
  provider,
  proxyAddress,
  userAddress,
}: {
  id?: string
  userAddress?: string
  proxyAddress?: string
  protocol?: string
  provider: JsonRpcProvider
  appChainId: ChainsValues
}) => {
  const userAddresses = [userAddress, proxyAddress].filter((p) => !!p) as string[]

  return graphqlFetcher<Positions, PositionsVariables>(POSITIONS, {
    where: {
      id,
      vaultName,
      owner_in: userAddresses.length > 0 ? userAddresses : undefined,
      collateral_not: '0', // TODO: if collateral is 0 then position is closed (always collateral >= normalDebt)
    },
  }).then(async ({ positions }) => {
    return Promise.all(positions.map((p) => wranglePosition(p, provider, appChainId)))
  })
}

export const usePositions = (id?: string, proxyAddress?: string, protocol?: string) => {
  const { address: userAddress, appChainId, readOnlyAppProvider: provider } = useWeb3Connection()
  const { data, error, mutate } = useSWR(
    ['positions', id, proxyAddress, userAddress, protocol],
    () => {
      if (!userAddress) return []
      return fetchPositions({
        id,
        proxyAddress,
        userAddress: userAddress,
        protocol,
        provider,
        appChainId,
      })
    },
  )

  // TODO Remove positionTransactions from here
  return { positions: data, error, refetch: mutate, loading: !error && !data }
}
