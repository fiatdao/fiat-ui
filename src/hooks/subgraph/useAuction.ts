import useSWR from 'swr'
import { AUCTION_BY_ID } from '@/src/queries/auction'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { wrangleAuction } from '@/src/utils/data/auctions'
import {
  auctionById,
  auctionByIdVariables,
  auctionById_userAuction,
} from '@/types/subgraph/__generated__/auctionById'

const getAuctionById = async (auctionId: string): Promise<auctionById> =>
  graphqlFetcher<auctionById, auctionByIdVariables>(AUCTION_BY_ID, { id: auctionId })

export const useAuction = (auctionId: string) => {
  const {
    address: currentUserAddress,
    appChainId,
    readOnlyAppProvider: provider,
  } = useWeb3Connection()

  const { data, error } = useSWR(
    ['auction', auctionId, currentUserAddress, appChainId, provider],
    async () => {
      const { userAuction } = await getAuctionById(auctionId)
      return wrangleAuction(userAuction as auctionById_userAuction, provider, appChainId)
    },
  )

  return {
    data,
    error,
    loading: !data && !error,
  }
}