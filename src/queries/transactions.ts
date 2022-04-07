import gql from 'graphql-tag'

export const TRANSACTIONS = gql`
  query Transactions($where: PositionTransactionAction_filter) {
    positionTransactionActions(where: $where) {
      __typename
      vaultName
      id
      collateral
      deltaCollateral
      normalDebt
      deltaNormalDebt
      transactionHash
      tokenId
      timestamp
      user
      vault {
        address
      }
      position {
        maturity
        collateralType {
          tokenId
          address
          underlierAddress
          underlierSymbol
          symbol
        }
      }
    }
  }
`
