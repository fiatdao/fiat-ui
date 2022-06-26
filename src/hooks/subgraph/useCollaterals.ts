import { usePositionsByUser } from './usePositionsByUser'
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
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import BigNumber from 'bignumber.js'

// TODO: reuse collateral fetching so fetching multiple by collateral address is the same code path as fetching one
export const fetchCollateralById = ({
  appChainId,
  collateralId,
  provider,
}: {
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
    return Promise.all(
      collateralTypes.map((p) => {
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
  appChainId,
  collaterals: userCollaterals,
  provider,
}: {
  collaterals?: string[]
  provider: Web3Provider | JsonRpcProvider
  appChainId: ChainsValues
}) => {
  return graphqlFetcher<Collaterals, CollateralsVariables>(appChainId, COLLATERALS, {
    where: {
      address_in: userCollaterals,
      vaultName_not_contains_nocase: 'deprecated',
    },
    orderBy: CollateralType_orderBy.maturity,
    orderDirection: OrderDirection.desc,
  }).then(async ({ collateralTypes, collybusDiscountRates, collybusSpots }) => {
    return Promise.all(
      collateralTypes.map((p) => {
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

export const useCollaterals = (
  filterByInMyWallet: boolean,
  filterOutMatured: boolean,
  protocolsToFilterBy: string[],
) => {
  const {
    address: currentUserAddress,
    appChainId,
    readOnlyAppProvider: provider,
  } = useWeb3Connection()
  const [collaterals, setCollaterals] = useState<Collateral[]>([])
  const { positions } = usePositionsByUser()

  const { data, error } = useSWR(['collaterals', appChainId], () =>
    fetchCollaterals({
      collaterals: undefined,
      provider,
      appChainId,
    }),
  )

  const userTokens = useUserTokensInWallet({
    collaterals: data,
    address: currentUserAddress,
    readOnlyAppProvider: provider,
  })

  useEffect(() => {
    // TODO: if running into performance issues,
    //  these filters should be applied on the subgraph queries
    const maturityFilteredData = filterOutMatured
      ? data?.filter((c) => Number(c.maturity) > Date.now()) // TODO Review maturity after `now` only.
      : data

    const walletFilteredData = filterByInMyWallet
      ? maturityFilteredData?.filter(
          (collateral) =>
            !!userTokens?.find((userToken: string) => collateral.address === userToken),
        )
      : maturityFilteredData

    const protocolFilteredData = walletFilteredData?.filter((c) =>
      protocolsToFilterBy.includes(c.protocol),
    )

    const vaultAddresses = getVaultAddresses(appChainId)
    const validVaultFilteredData = protocolFilteredData?.filter(({ vault }) =>
      vaultAddresses.includes(vault.address),
    )

    const newCollaterals = validVaultFilteredData?.map((collateral) => {
      const position = positions.find(
        (p) => p.collateral.address.toLowerCase() === collateral.address?.toLowerCase(),
      )
      return { ...collateral, manageId: position?.id }
    })

    sortByMaturity(newCollaterals)

    setCollaterals(newCollaterals || [])
  }, [
    data,
    positions,
    filterByInMyWallet,
    filterOutMatured,
    userTokens,
    protocolsToFilterBy,
    appChainId,
  ])

  if (isDev() && error) {
    console.error(error)
  }

  return collaterals
}
