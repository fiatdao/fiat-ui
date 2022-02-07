import { Position, YourPositionPageInformation } from '../hooks/subgraph'
import { min } from 'date-fns'

/**
 * Builds the information object for the Info Panels in Your Positions page
 * @param {Array<Position>} positions
 * @returns YourPositionPageInformation
 */
const fetchInfoPage = (positions: Position[]): YourPositionPageInformation => {
  const initialPositionInformation: YourPositionPageInformation = {
    totalDebt: 0,
    currentValue: 0,
    lowestHealthFactor: 0,
    nextMaturity: null,
  }

  return positions.reduce((acc, { discount, healthFactor, maturity, minted }) => {
    // totalDebt
    const totalDebt = acc.totalDebt + minted
    // currentValue
    const currentValue = acc.currentValue + discount

    // lowestHealthFactor
    const isNewLowest = acc.lowestHealthFactor === null || healthFactor < acc.lowestHealthFactor
    const lowestHealthFactor = isNewLowest ? healthFactor : acc.lowestHealthFactor

    // nextMaturity
    const maturityInMS = maturity.getTime()
    const nextMaturity =
      acc.nextMaturity === null ? maturityInMS : min([maturityInMS, acc.nextMaturity]).getTime()

    return { totalDebt, currentValue, lowestHealthFactor, nextMaturity }
  }, initialPositionInformation)
}

export { fetchInfoPage }
