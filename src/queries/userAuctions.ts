import gql from 'graphql-tag'
// TODO id as param here
//    query userAuctions($id: ID!) {
//       userAuctions(id: $id) {
export const USER_AUCTIONS = gql`
  query userAuctions {
    userAuctions {
      id
      auctionId
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
