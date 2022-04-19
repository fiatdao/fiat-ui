import { usePositionsByUser } from './usePositionsByUser'
import useSWR from 'swr'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { useEffect, useState } from 'react'
import isDev from '@/src/utils/isDev'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { Collaterals, CollateralsVariables } from '@/types/subgraph/__generated__/Collaterals'
import { ChainsValues } from '@/src/constants/chains'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { COLLATERALS } from '@/src/queries/collaterals'
import { Collateral, wrangleCollateral } from '@/src/utils/data/collaterals'
import { useUserTokensInWallet } from '@/src/hooks/useUserTokensInWallet'

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
  return graphqlFetcher<Collaterals, CollateralsVariables>(appChainId, COLLATERALS, {
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
  const {
    address: currentUserAddress,
    appChainId,
    readOnlyAppProvider: provider,
  } = useWeb3Connection()
  const [collaterals, setCollaterals] = useState<Collateral[]>([])
  const { positions } = usePositionsByUser()

  const { data, error } = useSWR(['collaterals', undefined, protocols?.join(''), appChainId], () =>
    fetchCollaterals({
      protocols: protocols?.length > 0 ? protocols : undefined,
      collaterals: undefined,
      provider,
      appChainId,
    }),
  )

  // const userTokens = useUserTokensInWallet(data?.map(c => c.address))
  const userTokens = useUserTokensInWallet({
    tokenAddresses: data?.map((c) => c.address),
    address: currentUserAddress,
    readOnlyAppProvider: provider,
  })

  useEffect(() => {
    const filteredData = inMyWallet
      ? data?.filter(
          (collateral) =>
            !!userTokens?.find((userToken: string) => collateral.address === userToken),
        )
      : data

    const newCollaterals = filteredData?.map((collateral) => {
      const position = positions.find(
        (p) => p.collateral.address.toLowerCase() === collateral.address?.toLowerCase(),
      )
      return { ...collateral, manageId: position?.id }
    })
    setCollaterals(newCollaterals || [])
  }, [data, positions, inMyWallet, userTokens])

  if (isDev() && error) {
    console.error(error)
  }

  return collaterals
}
