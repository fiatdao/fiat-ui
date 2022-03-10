import gql from 'graphql-tag'

export const USER_POSITIONS = gql`
  query positionsByUser($user: Bytes) {
    userPositions(where: { userAddress: $user }) {
      id
      userAddress
      totalCollateral
      totalFIAT
      positions {
        id
        vault {
          id
          address
          name
          type
          collateralizationRatio
          maxDiscount
        }
        vaultName
        collateralType {
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
          __typename
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
  }
`
