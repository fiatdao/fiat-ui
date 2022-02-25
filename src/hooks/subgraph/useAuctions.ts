import useSWR from 'swr'
import { UserAuction_filter } from '@/types/subgraph/__generated__/globalTypes'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { AUCTIONS } from '@/src/queries/auctions'
import { wrangleAuction } from '@/src/utils/data/auctions'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { auctions, auctionsVariables } from '@/types/subgraph/__generated__/auctions'
import { AuctionData } from '@/src/utils/data/auctions'

const fetchAuctions = async (where: UserAuction_filter | null) =>
  graphqlFetcher<auctions, auctionsVariables>(AUCTIONS, { where })

type UseAuctions = {
  auctions?: AuctionData[]
  loading: boolean
  error: any
}

export const useAuctions = (protocols: string[]): UseAuctions => {
  const { appChainId, readOnlyAppProvider: provider } = useWeb3Connection()

  const { data, error } = useSWR(['auctions', protocols.join(), appChainId, provider], async () => {
    const { userAuctions } = await fetchAuctions(
      protocols.length ? { vaultName_in: protocols } : null,
    )
    return Promise.all(userAuctions.map((auction) => wrangleAuction(auction, provider, appChainId)))
  })

  return { auctions: data, error, loading: !data && !error }
}
