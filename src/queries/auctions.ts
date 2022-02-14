import gql from 'graphql-tag'

export const AUCTION_BY_ID = gql`
  query auctionById($id: ID!) {
    userAuction(id: $id) {
      id
      collateralToSell
      tokenId
      vaultName
      isActive
      user
      collateral {
        underlierAddress
      }
    }
  }
`
