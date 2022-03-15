import gql from 'graphql-tag'

export const COLLATERALS = gql`
  query Collaterals($where: CollateralType_filter) {
    collateralTypes(where: $where) {
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
