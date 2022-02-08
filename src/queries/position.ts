import gql from 'graphql-tag'

export const POSITION_BY_ID = gql`
  query positionById($id: ID!) {
    position(id: $id) {
      id
      vault {
        id
        address
        name
        type
        collateralizationRatio
      }
      vaultName
      collateral {
        id
        tokenId
        address
        symbol
        maturity
        underlierSymbol
        underlierAddress
        vaultName
      }
      userPosition {
        id
        userAddress
        totalCollateral
        totalFIAT
      }
      totalCollateral
      totalNormalDebt
      maturity
      positionTransactions {
        id
        type
        collateral
        deltaCollateral
        normalDebt
        deltaNormalDebt
        transactionHash
        vaultName
        tokenId
        user
      }
    }
  }
`
