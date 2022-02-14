import gql from 'graphql-tag'

export const USER_AUCTIONS = gql`
  query userAuctions($where: UserAuction_filter) {
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
      }
      user
    }
  }
`
