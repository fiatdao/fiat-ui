import { usePositionsByUser } from './usePositionsByUser'
import useSWR from 'swr'
import { Web3Provider } from '@ethersproject/providers'
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
  provider: Web3Provider
  appChainId: ChainsValues
}) => {
  return graphqlFetcher<Collaterals, CollateralsVariables>(COLLATERALS, {
    where: { vaultName_in: vaultNames, address_in: userCollaterals },
  }).then(async ({ collaterals }) => {
    return Promise.all(
      collaterals
        .filter((c) => Number(c.maturity) > Date.now() / 1000) // TODO Review maturity after `now` only.
        .map((p) => wrangleCollateral(p, provider, appChainId)),
    )
  })
}

export const useCollaterals = (inMyWallet: boolean, protocols: string[]) => {
  const { appChainId, web3Provider: provider } = useWeb3Connection()
  const { positions } = usePositionsByUser()

  if (!provider) {
    throw 'useCollateral without user'
  }

  // TODO Make this more performante avoiding wrangle of positions or the whole query when inMyWallet is false
  const collaterals = inMyWallet ? _.uniq(positions.map((p) => p.collateral.address)) : undefined

  const { data } = useSWR(['collaterals', collaterals?.join(''), protocols?.join('')], () =>
    fetchCollaterals({
      protocols: protocols?.length > 0 ? protocols : undefined,
      collaterals,
      provider,
      appChainId,
    }),
  )

  return data
}
