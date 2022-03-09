import gql from 'graphql-tag'

export const POSITIONS = gql`
  query Positions($where: Position_filter) {
    positions(where: $where) {
      id
      vaultName
      maturity
      totalCollateral
      totalNormalDebt
      collateralType {
        symbol
        address
        underlierSymbol
        underlierAddress
        tokenId
      }
      vault {
        address
        maxDiscount
        collateralizationRatio
        interestPerSecond
      }
    }
  }
`
