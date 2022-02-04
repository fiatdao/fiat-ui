import gql from 'graphql-tag'

export const COLLATERALS = gql`
  query collaterals {
    collaterals {
      id
      symbol
      maturity
      tokenId
      underlierSymbol
      underlierAddress
      faceValue
      vault {
        id
        name
        address
        collaterizationRatio
      }
    }
  }
`
