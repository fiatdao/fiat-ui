import { usePositionsByUser } from './usePositionsByUser'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { useEffect, useState } from 'react'
import useSWR from 'swr'
import BigNumber from 'bignumber.js'
import { getVaultAddressesByName } from '@/src/constants/bondTokens'
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
  const vaultsAddresses = vaultNames
    ?.map((vaultName) => getVaultAddressesByName(appChainId, vaultName))
    .flat()

  return graphqlFetcher<Collaterals, CollateralsVariables>(appChainId, COLLATERALS, {
    // @TODO: add maturity filter maturity_gte (Date.now()/1000).toString()
    // @TODO: quick fix to hide deprecated vaults, filter by vaultName_not_contains deprecated
    where: {
      vault_in: vaultsAddresses,
      address_in: userCollaterals,
      vaultName_not_contains_nocase: 'deprecated',
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

  const { data, error } = useSWR(['collaterals', protocols?.join(''), appChainId], () =>
    fetchCollaterals({
      protocols: protocols?.length > 0 ? protocols : undefined,
      collaterals: undefined,
      provider,
      appChainId,
    }),
  )

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

    sortByMaturity(newCollaterals)

    setCollaterals(newCollaterals || [])
  }, [data, positions, inMyWallet, userTokens])

  if (isDev() && error) {
    console.error(error)
  }

  return collaterals
}
