import { usePositionsByUser } from './usePositionsByUser'
import useSWR from 'swr'
import { JsonRpcProvider } from '@ethersproject/providers'
import _ from 'lodash'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { Collaterals, CollateralsVariables } from '@/types/subgraph/__generated__/collaterals'
import { ChainsValues } from '@/src/constants/chains'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { COLLATERALS } from '@/src/queries/collaterals'
import { wrangleCollateral } from '@/src/utils/data/collaterals'

// TODO Import readonly provider from singleton
export const fetchCollaterals = ({
  appChainId,
  collaterals: userCollaterals,
  protocols: vaultNames,
  provider,
}: {
  protocols?: string[]
  collaterals?: string[]
  provider: JsonRpcProvider
  appChainId: ChainsValues
}) => {
  const where = _.omitBy({ vaultName_in: vaultNames, address_in: userCollaterals }, _.isNil)
  console.log({ where })
  return graphqlFetcher<Collaterals, CollateralsVariables>(COLLATERALS, {
    where: { vaultName_in: vaultNames, address_in: userCollaterals },
  }).then(async ({ collaterals }) => {
    console.log({ returnedCollaterals: collaterals, userCollaterals, appChainId, provider })
    return Promise.all(collaterals.map((p) => wrangleCollateral(p, provider, appChainId)))
  })
}

export const useCollaterals = (inMyWallet: boolean, protocols: string[]) => {
  const { appChainId, readOnlyAppProvider: provider } = useWeb3Connection()
  const { positions } = usePositionsByUser()

  console.log({ inMyWallet, positions, protocols })
  // TODO Make this more performante avoiding wrangle of positions and maybe avoiding the whole query
  const collaterals = inMyWallet ? _.uniq(positions.map((p) => p.collateral.address)) : []
  const { data } = useSWR(['collaterals', collaterals.join(''), protocols?.join('')], () =>
    fetchCollaterals({
      protocols: protocols?.length > 0 ? protocols : undefined,
      collaterals: collaterals.length > 0 ? collaterals : undefined,
      provider,
      appChainId,
    }),
  )

  return data
}
