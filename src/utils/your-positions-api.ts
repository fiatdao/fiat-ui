import { remainingTime } from './your-positions-utils'
import { min } from 'date-fns'

export type YourPositionPageInformation = {
  totalDebt: number
  currentValue: number
  lowestHealthFactor: number | null
  nextMaturity: string
}

const fetchInfoPage = (positions: any[]): Promise<YourPositionPageInformation> => {
  let totalDebt = 0
  let currentValue = 0
  let lowestHealthFactor: number | null = null
  let nextMaturity: Date | null = null

  positions.forEach((position) => {
    totalDebt += position.minted
    currentValue += position.discount

    lowestHealthFactor = !lowestHealthFactor
      ? position.healthFactor
      : position.healthFactor < lowestHealthFactor
      ? position.healthFactor
      : lowestHealthFactor

    nextMaturity = !nextMaturity ? position.maturity : min([position.maturity, nextMaturity])
  })

  return Promise.resolve({
    totalDebt,
    currentValue,
    lowestHealthFactor,
    nextMaturity: remainingTime(nextMaturity),
  })
}

export { fetchInfoPage }
