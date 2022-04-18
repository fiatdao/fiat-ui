import gql from 'graphql-tag'

export const COLLATERALS = gql`
  query Collaterals($where: CollateralType_filter) {
    collateralTypes(where: $where) {
      id
      tokenId
      symbol
      underlierSymbol
      underlierAddress
      maturity
      address
      faceValue
      eptData {
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
        debtFloor
        name
      }
    }
  }
`
