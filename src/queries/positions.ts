import gql from 'graphql-tag'

export const POSITIONS = gql`
  query Positions($where: Position_filter) {
    positions(where: $where) {
      id
      vaultName
      maturity
      owner
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
