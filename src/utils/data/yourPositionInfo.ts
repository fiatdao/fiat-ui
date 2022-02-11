import { Position } from './positions'
import BigNumber from 'bignumber.js'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'

export type YourPositionPageInformation = {
  collateralValue: BigNumber
  fiatDebt: BigNumber
  lowestHealthFactor: BigNumber
  nearestMaturity: Date
}

const fetchInfoPage = (_positions: Position[]): YourPositionPageInformation => {
  const initialPositionInformation: YourPositionPageInformation = {
    collateralValue: ZERO_BIG_NUMBER,
    fiatDebt: ZERO_BIG_NUMBER,
    lowestHealthFactor: ZERO_BIG_NUMBER,
    nearestMaturity: new Date(),
  }

  return initialPositionInformation

  //   return positions.reduce((acc, { discount, healthFactor, maturity, minted }) => {
  //     // totalDebt
  //     const totalDebt = acc.totalDebt + minted
  //     // currentValue
  //     const currentValue = acc.currentValue + discount

  //     // lowestHealthFactor
  //     const isNewLowest = acc.lowestHealthFactor === null || healthFactor < acc.lowestHealthFactor
  //     const lowestHealthFactor = isNewLowest ? healthFactor : acc.lowestHealthFactor

  //     // nextMaturity
  //     const maturityInMS = maturity.getTime()
  //     const nextMaturity =
  //       acc.nextMaturity === null ? maturityInMS : min([maturityInMS, acc.nextMaturity]).getTime()

  //     return { totalDebt, currentValue, lowestHealthFactor, nextMaturity }
  //   }, initialPositionInformation)
}

export { fetchInfoPage }
