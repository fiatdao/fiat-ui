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
      position {
        maturity
        collateralType {
          address
          underlierAddress
          underlierSymbol
          symbol
        }
      }
    }
  }
`
