import { Position } from './positions'
import BigNumber from 'bignumber.js'
import { min } from 'date-fns'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'

export type YourPositionPageInformation = {
  collateralValue: BigNumber
  fiatDebt: BigNumber
  lowestHealthFactor: BigNumber | null
  nearestMaturity: Date | null
}

const fetchInfoPage = (positions: Position[]): YourPositionPageInformation => {
  const initialPositionInformation: YourPositionPageInformation = {
    collateralValue: ZERO_BIG_NUMBER,
    fiatDebt: ZERO_BIG_NUMBER,
    lowestHealthFactor: null,
    nearestMaturity: null,
  }

  positions.forEach((p) => {
    // TODO: need to calculate in USD
    initialPositionInformation.collateralValue = initialPositionInformation.collateralValue.plus(
      p.totalCollateral,
    )
    initialPositionInformation.fiatDebt = initialPositionInformation.collateralValue.plus(
      p.totalNormalDebt,
    )
    if (!initialPositionInformation.nearestMaturity) {
      initialPositionInformation.nearestMaturity = p.maturity
    } else {
      initialPositionInformation.nearestMaturity = min([
        p.maturity,
        initialPositionInformation.nearestMaturity,
      ])
    }
    if (
      !initialPositionInformation.lowestHealthFactor ||
      p.healthFactor.lte(initialPositionInformation.lowestHealthFactor)
    ) {
      initialPositionInformation.lowestHealthFactor = p.healthFactor
    }
  })
  return initialPositionInformation
}

export { fetchInfoPage }
