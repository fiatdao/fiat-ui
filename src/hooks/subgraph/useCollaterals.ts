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
  }).then(async ({ collateralTypes }) => {
    return Promise.all(
      collateralTypes
        .filter((c) => Number(c.maturity) > Date.now() / 1000) // TODO Review maturity after `now` only.
        .map((p) => wrangleCollateral(p, provider, appChainId)),
    )
  })
}

export const useCollaterals = (inMyWallet: boolean, protocols: string[]) => {
  const { address, appChainId, readOnlyAppProvider, web3Provider } = useWeb3Connection()
  const { positions } = usePositionsByUser()

  // TODO Make this more performante avoiding wrangle of positions or the whole query when inMyWallet is false
  const collaterals = inMyWallet ? _.uniq(positions.map((p) => p.collateral.address)) : undefined

  const provider = web3Provider ?? (readOnlyAppProvider as Web3Provider)

  const { data, error } = useSWR(
    ['collaterals', collaterals?.join(''), protocols?.join(''), address],
    () =>
      provider
        ? fetchCollaterals({
            protocols: protocols?.length > 0 ? protocols : undefined,
            collaterals,
            provider,
            appChainId,
          })
        : [],
  )

  if (isDev() && error) {
    console.error(error)
  }

  return data
}
