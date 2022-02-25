import gql from 'graphql-tag'

export const AUCTIONS = gql`
  query auctions($where: UserAuction_filter) {
    userAuctions(where: $where) {
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
      }
      collateral {
        id
        tokenId
        symbol
        underlierAddress
        underlierSymbol
      }
      user
    }
  }
`
