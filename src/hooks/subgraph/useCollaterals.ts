import { usePositionsByUser } from './usePositionsByUser'
import useSWR from 'swr'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import _ from 'lodash'
import { useEffect, useState } from 'react'
import isDev from '@/src/utils/isDev'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { Collaterals, CollateralsVariables } from '@/types/subgraph/__generated__/Collaterals'
import { ChainsValues } from '@/src/constants/chains'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { COLLATERALS } from '@/src/queries/collaterals'
import { Collateral, wrangleCollateral } from '@/src/utils/data/collaterals'

// TODO Import readonly provider from singleton
export const fetchCollaterals = ({
  appChainId,
  collaterals: userCollaterals,
  protocols: vaultNames,
  provider,
}: {
  protocols?: string[]
  collaterals?: string[]
  provider: Web3Provider | JsonRpcProvider
  appChainId: ChainsValues
}) => {
  return graphqlFetcher<Collaterals, CollateralsVariables>(COLLATERALS, {
    // @TODO: add maturity filter maturity_gte (Date.now()/1000).toString()
    // @TODO: quick fix to hide deprecated vaults, filter by vaultName_not_contains deprecated
    where: {
      vaultName_in: vaultNames,
      address_in: userCollaterals,
      vaultName_not_contains_nocase: 'deprecated',
    },
  }).then(async ({ collateralTypes }) => {
    return Promise.all(
      collateralTypes
        .filter((c) => Number(c.maturity) > Date.now() / 1000) // TODO Review maturity after `now` only.
        .map((p) => wrangleCollateral(p, provider, appChainId)),
    )
  })
}

export const useCollaterals = (inMyWallet: boolean, protocols: string[]) => {
  const { appChainId, readOnlyAppProvider: provider } = useWeb3Connection()
  const [collaterals, setCollaterals] = useState<Collateral[]>([])
  const { positions } = usePositionsByUser()

  // TODO Make this more performante avoiding wrangle of positions or the whole query when inMyWallet is false
  const userPositionCollaterals = inMyWallet
    ? _.uniq(positions.map((p) => p.collateral.address))
    : undefined

  const { data, error } = useSWR(
    ['collaterals', userPositionCollaterals?.join(''), protocols?.join('')],
    () =>
      fetchCollaterals({
        protocols: protocols?.length > 0 ? protocols : undefined,
        collaterals: userPositionCollaterals,
        provider,
        appChainId,
      }),
  )
  useEffect(() => {
    const newCollaterals = data?.map((collateral) => {
      const position = positions.find(
        (p) => p.collateral.address.toLowerCase() === collateral.address?.toLowerCase(),
      )
      return { ...collateral, manageId: position?.id }
    })
    setCollaterals(newCollaterals || [])
  }, [data, positions])

  if (isDev() && error) {
    console.error(error)
  }

  return collaterals
}
