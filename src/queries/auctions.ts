import gql from 'graphql-tag'

export const AUCTIONS = gql`
  query auctions($where: CollateralAuction_filter) {
    collateralAuctions(where: $where) {
      id
      auctionId
      isActive
      collateralToSell
      tokenId
      vaultName
      vault {
        id
        name
        address
        interestPerSecond
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
      user
    }
  }
`
