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
      underlierScale
      maturity
      address
      scale
      faceValue
      eptData {
        id
        balancerVault
        convergentCurvePool
        poolId
      }
      vault {
        id
        defaultRateId
        type
        collateralizationRatio
        address
        interestPerSecond
        vaultType
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
  }
`
