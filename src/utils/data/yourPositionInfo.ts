import { Position } from './positions'
import BigNumber from 'bignumber.js'
import { min } from 'date-fns'
import { useEffect, useState } from 'react'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'

export type YourPositionPageInformation = {
  collateralValue: BigNumber
  fiatDebt: BigNumber
  lowestHealthFactor: {
    value: BigNumber | null
    address: string | null
  }
  nearestMaturity: {
    value: Date | null
    address: string | null
  }
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
        lowestHealthFactor: {
          value: null,
          address: null,
        },
        nearestMaturity: {
          value: null,
          address: null,
        },
      }

      positions.forEach(async (p) => {
        initialPositionInformation.collateralValue =
          initialPositionInformation.collateralValue.plus(p.collateralValue)
        initialPositionInformation.fiatDebt = initialPositionInformation.fiatDebt.plus(
          p.totalNormalDebt,
        )
        if (!initialPositionInformation.nearestMaturity?.value) {
          initialPositionInformation.nearestMaturity.value = p.maturity
          initialPositionInformation.nearestMaturity.address = p.protocolAddress
        } else {
          const minValue = min([p.maturity, initialPositionInformation?.nearestMaturity.value])
          initialPositionInformation.nearestMaturity.value = minValue
          if (minValue === p.maturity) {
            initialPositionInformation.nearestMaturity.address = p.protocolAddress
          }
        }
        if (
          !initialPositionInformation.lowestHealthFactor.value ||
          p.healthFactor.lte(initialPositionInformation.lowestHealthFactor.value)
        ) {
          initialPositionInformation.lowestHealthFactor.value = p.healthFactor
          initialPositionInformation.lowestHealthFactor.address = p.protocolAddress
        }
      })
      setPageInformation(initialPositionInformation)
    }
    fetchInfoPage()
  }, [positions])
  return { pageInformation }
}

export { useYourPositionInfoPage }
