import gql from 'graphql-tag'

export const COLLATERALS = gql`
  query Collaterals(
    $where: CollateralType_filter
    $orderBy: CollateralType_orderBy
    $orderDirection: OrderDirection
  ) {
    collateralTypes(where: $where, orderBy: $orderBy, orderDirection: $orderDirection) {
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
    collybusSpots(orderDirection: $orderDirection) {
      id
      token
      spot
    }
    collybusDiscountRates {
      id
      rateId
      discountRate
    }
    vaults {
      defaultRateId
      id
    }
  }
`
