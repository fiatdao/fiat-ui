import { usePositionsByUser } from './usePositionsByUser'
import useSWR from 'swr'
import { Web3Provider } from '@ethersproject/providers'
import _ from 'lodash'
import isDev from '@/src/utils/isDev'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { Collaterals, CollateralsVariables } from '@/types/subgraph/__generated__/Collaterals'
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
  const { address: userAddress, appChainId, web3Provider: provider } = useWeb3Connection()
  console.log('******')

  const { positions } = usePositionsByUser()

  // TODO Make this more performante avoiding wrangle of positions or the whole query when inMyWallet is false
  const collaterals = inMyWallet ? _.uniq(positions.map((p) => p.collateral.address)) : undefined
  // console.log('[useCollaterals] collaterals: ', collaterals)
  // console.log('[useCollaterals] user address: ', userAddress)

  const key = userAddress
    ? ['collaterals', collaterals?.join(''), protocols?.join(''), userAddress]
    : ['collaterals', collaterals?.join(''), protocols?.join('')]

  console.log('[useCollaterals] key: ', key)
  console.log('[useCollaterals] Provider: ', provider)
  console.log('[useCollaterals]  Protocols: ', protocols)
  console.log('[useCollaterals] Collaterals: ', collaterals)
  console.log('[useCollaterals] Appchainid: ', appChainId)

  const { data, error } = useSWR(key, () =>
    provider
      ? fetchCollaterals({
          protocols: protocols?.length > 0 ? protocols : undefined,
          collaterals,
          provider,
          appChainId,
        })
      : [],
  )

  if (isDev() && error) console.error(error)

  console.log('******')
  return data
}
