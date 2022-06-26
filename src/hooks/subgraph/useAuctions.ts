import { getVaultAddresses } from '@/src/constants/bondTokens'
import { ChainsValues } from '@/src/constants/chains'
import { CollateralAuction_filter } from '@/types/subgraph/__generated__/globalTypes'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { AUCTIONS } from '@/src/queries/auctions'
import { wrangleAuction } from '@/src/utils/data/auctions'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { auctions, auctionsVariables } from '@/types/subgraph/__generated__/auctions'
import { AuctionData } from '@/src/utils/data/auctions'
import useSWR from 'swr'
import { useEffect, useState } from 'react'

const fetchAuctions = async (appChainId: ChainsValues, where: CollateralAuction_filter | null) =>
  graphqlFetcher<auctions, auctionsVariables>(appChainId, AUCTIONS, { where })

type UseActiveAuctions = {
  auctions?: AuctionData[]
  loading: boolean
  error: any
}

export const useActiveAuctions = (protocolsToFilterBy: string[]): UseActiveAuctions => {
  const { appChainId, readOnlyAppProvider: provider } = useWeb3Connection()
  const [auctions, setAuctions] = useState<AuctionData[]>([])

  const vaultAddresses = getVaultAddresses(appChainId)

  const { data, error } = useSWR(['auctions', appChainId], async () => {
    const [{ collateralAuctions }, { timestamp }] = await Promise.all([
      fetchAuctions(appChainId, {
        vault_in: vaultAddresses,
        vaultName_not_contains_nocase: 'deprecated',
        debt_gt: '0', // this filters out completed auctions
      }),
      provider.getBlock('latest'),
    ])
    const wrangledAuctions = await Promise.all(
      collateralAuctions.map((auction) => wrangleAuction(auction, provider, appChainId, timestamp)),
    )
    return wrangledAuctions
  })

  useEffect(() => {
    // Apply filters
    const wrangledFilteredAuctions = data?.filter((a) =>
      protocolsToFilterBy.includes(a.protocol.humanReadableName),
    )

    setAuctions(wrangledFilteredAuctions || [])
  }, [data, protocolsToFilterBy])

  return { auctions, error, loading: !data && !error }
}
