import gql from 'graphql-tag'

export const POSITIONS = gql`
  query positions {
    positions {
      id
      vaultName
      maturity
      totalCollateral
      totalNormalDebt
      collateral {
        symbol
        address
        underlierSymbol
        underlierAddress
      }
      vault {
        address
        maxDiscount
        collateralizationRatio
      }
    }
  }
`
