import gql from 'graphql-tag'

export const POSITIONS = gql`
  query positions {
    positions {
      id
      vault {
        id
        address
        name
        type
        collaterizationRatio
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
