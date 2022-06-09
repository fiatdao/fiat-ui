import { AUCTION_MAIN_DATA } from '@/src/queries/auction'
import gql from 'graphql-tag'

export const AUCTIONS = gql`
  ${AUCTION_MAIN_DATA}
  query auctions($where: CollateralAuction_filter) {
    collateralAuctions(where: $where) {
      ...Auction
    }
  }
`
