import { usePositionsByUser } from './usePositionsByUser'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import BigNumber from 'bignumber.js'
import { getVaultAddresses } from '@/src/constants/bondTokens'
import { ChainsValues } from '@/src/constants/chains'
import { useUserTokensInWallet } from '@/src/hooks/useUserTokensInWallet'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { COLLATERALS } from '@/src/queries/collaterals'
import { Collateral, wrangleCollateral } from '@/src/utils/data/collaterals'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import isDev from '@/src/utils/isDev'
import sortByMaturity from '@/src/utils/sortByMaturity'
import {
  Collaterals,
  CollateralsVariables,
  Collaterals_collybusSpots,
} from '@/types/subgraph/__generated__/Collaterals'
import { CollateralType_orderBy, OrderDirection } from '@/types/subgraph/__generated__/globalTypes'
import { Maybe } from '@/types/utils'

// TODO: reuse collateral fetching so fetching multiple by collateral address is the same code path as fetching one
export const fetchCollateralById = ({
  appChainId,
  collateralId,
  provider,
}: {
  protocols?: string[]
  collateralId: string
  provider: Web3Provider | JsonRpcProvider
  appChainId: ChainsValues
}) => {
  const vaultsAddresses = getVaultAddresses(appChainId)
  return graphqlFetcher<Collaterals, CollateralsVariables>(appChainId, COLLATERALS, {
    where: {
      vault_in: vaultsAddresses,
      id_in: [collateralId],
      vaultName_not_contains_nocase: 'deprecated',
    },
    orderBy: CollateralType_orderBy.maturity,
    orderDirection: OrderDirection.desc,
  }).then(async ({ collateralTypes, collybusDiscountRates, collybusSpots }) => {
    // TODO: get discountRate arg in here
    return Promise.all(
      collateralTypes
        .filter((c) => Number(c.maturity) > Date.now() / 1000) // TODO Review maturity after `now` only.
        .map((p) => {
          const spotPrice: Maybe<Collaterals_collybusSpots> =
            collybusSpots.find((s) => s.token === p.underlierAddress) ?? null
          const discountRate: Maybe<BigNumber> =
            BigNumber.from(
              collybusDiscountRates.find(({ rateId }) => rateId === p.vault?.defaultRateId)
                ?.discountRate,
            ) ?? null

          return wrangleCollateral(p, provider, appChainId, spotPrice, discountRate)
        }),
    )
  })
}

// TODO Import readonly provider from singleton
export const fetchCollaterals = ({
  protocols,
  collaterals: userCollaterals,
  appChainId,
  provider,
}: {
  protocols?: string[]
  collaterals?: string[]
  provider: Web3Provider | JsonRpcProvider
  appChainId: ChainsValues
}) => {
  console.log('[fetchCollaterals] protocols: ', protocols)
  return graphqlFetcher<Collaterals, CollateralsVariables>(appChainId, COLLATERALS, {
    // @TODO: add maturity filter maturity_gte (Date.now()/1000).toString()
    // @TODO: quick fix to hide deprecated vaults, filter by vaultName_not_contains deprecated
    where: {
      address_in: userCollaterals,
      vaultName_not_contains_nocase: 'deprecated',
      // should filter on collateral.vault.type (Element) or collateral.protocol (Element Finance) name ackshually
      // vaultName_in: ["vaultEPT_eP:eyUSDC:10-AUG-22-GMT"],
    },
    orderBy: CollateralType_orderBy.maturity,
    orderDirection: OrderDirection.desc,
  }).then(async ({ collateralTypes, collybusDiscountRates, collybusSpots }) => {
    return Promise.all(
      collateralTypes
        .filter((c) => Number(c.maturity) > Date.now() / 1000) // TODO Review maturity after `now` only.
        .map((p) => {
          const spotPrice: Maybe<Collaterals_collybusSpots> =
            collybusSpots.find((s) => s.token === p.underlierAddress) ?? null
          const discountRate: Maybe<BigNumber> =
            BigNumber.from(
              collybusDiscountRates.find(({ rateId }) => rateId === p.vault?.defaultRateId)
                ?.discountRate,
            ) ?? null

          return wrangleCollateral(p, provider, appChainId, spotPrice, discountRate)
        }),
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

  console.log('[useCollaterals] filters: ', protocols)
  const { data, error } = useSWR(['collaterals', appChainId], () =>
    fetchCollaterals({
      protocols: protocols?.length > 0 ? protocols : undefined,
      collaterals: undefined,
      provider,
      appChainId,
    }),
  )
  console.log('[useCollaterals] data: ', data)

  const userTokens = useUserTokensInWallet({
    collaterals: data,
    address: currentUserAddress,
    readOnlyAppProvider: provider,
  })

  useEffect(() => {
    const walletFilteredData = inMyWallet
      ? data?.filter(
          (collateral) =>
            !!userTokens?.find((userToken: string) => collateral.address === userToken),
        )
      : data
    const vaultAddresses = getVaultAddresses(appChainId)
    const filteredData = walletFilteredData?.filter(({ vault }) =>
      vaultAddresses.includes(vault.address),
    )

    const newCollaterals = filteredData?.map((collateral) => {
      const position = positions.find(
        (p) => p.collateral.address.toLowerCase() === collateral.address?.toLowerCase(),
      )
      return { ...collateral, manageId: position?.id }
    })

    sortByMaturity(newCollaterals)

    setCollaterals(newCollaterals || [])
  }, [data, positions, inMyWallet, userTokens, protocols, appChainId])

  if (isDev() && error) {
    console.error(error)
  }

  return collaterals
}
