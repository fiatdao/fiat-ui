import { SUBGRAPH_API } from '../constants/misc'
import {
  Position,
  PositionTransaction,
  YourPositionPageInformation,
  transformPosition,
} from '../hooks/subgraph'
import { min } from 'date-fns'

/**
 * Fetches Position information by its ID
 *
 * @param {string} positionId
 * @returns {Promise<[Position, Array<PositionTransaction>]>}
 */
const fetchPositionById = (positionId: string): Promise<[Position, PositionTransaction[]]> => {
  const vaultKeys = 'vault {id,name,address,underlyingAsset}'
  const transactionKeys = 'positionTransactions {id,type,collateral,normalDebt}'
  const keys = `{id,tokenId,user,collateral,normalDebt,${vaultKeys},${transactionKeys}}`
  const query = { query: `{position(id: "${positionId}")${keys}}` }

  return fetch(SUBGRAPH_API, {
    method: 'POST',
    body: JSON.stringify(query),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response.json())
    .then((jsonResponse) => jsonResponse.data.position)
    .then(transformPosition)
}

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

export { fetchPositionById, fetchInfoPage }
