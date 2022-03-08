import gql from 'graphql-tag'

export const COLLATERALS = gql`
  query Collaterals($where: Collateral_filter) {
    collaterals(where: $where) {
      id
      tokenId
      vaultName
      symbol
      underlierSymbol
      underlierAddress
      maturity
      address
      faceValue
      ccp {
        id
        balancerVault
        convergentCurvePool
        poolId
      }
      vault {
        id
        type
        collateralizationRatio
        address
        interestPerSecond
      }
    }
  }
`
