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
      user
      vault
      position {
        maturity
        collateral {
          address
          underlierAddress
          underlierSymbol
          symbol
        }
      }
    }
  }
`
