import gql from 'graphql-tag'

export const POSITIONS = gql`
  query positions($user: Bytes!) {
    positions(where: { user: $user }) {
      id
      tokenId
      user
      collateral
      normalDebt
      vault {
        id
        name
        address
        underlyingAsset
      }
      positionTransactions {
        id
        type
        collateral
        normalDebt
      }
    }
  }
`
