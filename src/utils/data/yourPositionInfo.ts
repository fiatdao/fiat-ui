import { Position } from './positions'
import BigNumber from 'bignumber.js'
import { min } from 'date-fns'
import { useEffect, useState } from 'react'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'

export type YourPositionPageInformation = {
  collateralValue: BigNumber
  fiatDebt: BigNumber
  lowestHealthFactor: BigNumber | null
  nearestMaturity: Date | null
}

type UseYourPositionInfoPage = {
  pageInformation?: YourPositionPageInformation
}

const useYourPositionInfoPage = (positions: Position[]): UseYourPositionInfoPage => {
  const [pageInformation, setPageInformation] = useState<YourPositionPageInformation>()

  useEffect(() => {
    const fetchInfoPage = async (): Promise<void> => {
      const initialPositionInformation: YourPositionPageInformation = {
        collateralValue: ZERO_BIG_NUMBER,
        fiatDebt: ZERO_BIG_NUMBER,
        lowestHealthFactor: null,
        nearestMaturity: null,
      }

      positions.forEach(async (p) => {
        initialPositionInformation.collateralValue =
          initialPositionInformation.collateralValue.plus(p.collateralValue)
        initialPositionInformation.fiatDebt = initialPositionInformation.fiatDebt.plus(
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
      setPageInformation(initialPositionInformation)
    }
    fetchInfoPage()
  }, [positions])
  return { pageInformation }
}

export { useYourPositionInfoPage }
