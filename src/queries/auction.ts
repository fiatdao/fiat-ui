import gql from 'graphql-tag'

export const AUCTION_BY_ID = gql`
  query auctionById($id: ID!) {
    collateralAuction(id: $id) {
      id
      collateralToSell
      tokenId
      vaultName
      isActive
      user
      tokenId
      debt
      startsAt
      collateralType {
        address
        faceValue
        maturity
        symbol
        tokenId
        underlierAddress
        underlierSymbol
      }
      vault {
        address
        name
        interestPerSecond
        maxAuctionDuration
      }
    }
  }
`
