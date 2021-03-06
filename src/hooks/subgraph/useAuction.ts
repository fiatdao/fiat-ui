import { ChainsValues } from '@/src/constants/chains'
import { AUCTION_BY_ID } from '@/src/queries/auction'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { wrangleAuction } from '@/src/utils/data/auctions'
import {
  auctionById,
  auctionByIdVariables,
  auctionById_collateralAuction,
} from '@/types/subgraph/__generated__/auctionById'
import useSWR from 'swr'

const getAuctionById = async (appChainId: ChainsValues, auctionId: string): Promise<auctionById> =>
  graphqlFetcher<auctionById, auctionByIdVariables>(appChainId, AUCTION_BY_ID, { id: auctionId })

export const useAuction = (auctionId: string) => {
  const {
    address: currentUserAddress,
    appChainId,
    readOnlyAppProvider: provider,
  } = useWeb3Connection()

  const { data, error } = useSWR(
    ['auction', auctionId, currentUserAddress, appChainId, provider],
    async () => {
      const [{ collateralAuction }, { timestamp }] = await Promise.all([
        getAuctionById(appChainId, auctionId),
        provider.getBlock('latest'),
      ])
      return wrangleAuction(
        collateralAuction as auctionById_collateralAuction,
        provider,
        appChainId,
        timestamp,
      )
    },
  )

  return {
    data,
    error,
    loading: !data && !error,
  }
}
