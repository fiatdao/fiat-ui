import gql from 'graphql-tag'

export const AUCTION_MAIN_DATA = gql`
  fragment Auction on CollateralAuction {
    id
    auctionId
    isActive
    collateralToSell
    tokenId
    vaultName
    debt
    startsAt
    startPrice
    user
    vault {
      id
      name
      address
      interestPerSecond
      maxAuctionDuration
    }
    collateralType {
      id
      address
      faceValue
      maturity
      tokenId
      symbol
      underlierAddress
      underlierSymbol
    }
  }
`

export const AUCTION_BY_ID = gql`
  ${AUCTION_MAIN_DATA}
  query auctionById($id: ID!) {
    collateralAuction(id: $id) {
      ...Auction
    }
  }
`
