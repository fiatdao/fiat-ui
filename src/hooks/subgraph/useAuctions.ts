import useSWR from 'swr'
import { CollateralAuction_filter } from '@/types/subgraph/__generated__/globalTypes'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { AUCTIONS } from '@/src/queries/auctions'
import { wrangleAuction } from '@/src/utils/data/auctions'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { auctions, auctionsVariables } from '@/types/subgraph/__generated__/auctions'
import { AuctionData } from '@/src/utils/data/auctions'

const fetchAuctions = async (where: CollateralAuction_filter | null) =>
  graphqlFetcher<auctions, auctionsVariables>(AUCTIONS, { where })

type UseAuctions = {
  auctions?: AuctionData[]
  loading: boolean
  error: any
}

export const useAuctions = (protocols: string[]): UseAuctions => {
  const { appChainId, readOnlyAppProvider: provider } = useWeb3Connection()

  // @TODO: quick fix to hide deprecated vaults, filter by vaultName_not_contains deprecated
  const { data, error } = useSWR(['auctions', protocols.join(), appChainId, provider], async () => {
    const [{ collateralAuctions }, { timestamp }] = await Promise.all([
      fetchAuctions(
        protocols.length
          ? { vaultName_in: protocols, vaultName_not_contains_nocase: 'deprecated' }
          : null,
      ),
      provider.getBlock('latest'),
    ])
    return Promise.all(
      collateralAuctions.map((auction) => wrangleAuction(auction, provider, appChainId, timestamp)),
    )
  })

  return { auctions: data, error, loading: !data && !error }
}
