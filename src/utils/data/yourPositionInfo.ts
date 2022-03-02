import { Position } from './positions'
import { getCurrentValue } from '../getCurrentValue'
import BigNumber from 'bignumber.js'
import { min } from 'date-fns'
import { JsonRpcProvider } from '@ethersproject/providers'
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

const useYourPositionInfoPage = (
  positions: Position[],
  provider: JsonRpcProvider,
): UseYourPositionInfoPage => {
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
        // TODO: need to calculate in USD (fair price?)
        const collateralValue = await getCurrentValue(provider, 1, p.tokenId, p.protocolAddress)
        initialPositionInformation.collateralValue =
          initialPositionInformation.collateralValue.plus(collateralValue)
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
  }, [positions, provider])
  return { pageInformation }
}

export { useYourPositionInfoPage }
