import { contracts } from '@/src/constants/contracts'
import contractCall from '@/src/utils/contractCall'
import { currencyIds } from '@/src/constants/currencyIds'
import { ChainsValues } from '@/src/constants/chains'
import { JsonRpcProvider } from '@ethersproject/providers'

export const getMinImpliedRate = async (
  fCash: any,
  maxSlippage: any,
  appChainId: ChainsValues,
  collateral: any,
  provider: JsonRpcProvider,
): Promise<any> => {
  const underlier = collateral.underlierSymbol ?? ''
  const currencyId = currencyIds[underlier as keyof typeof currencyIds]

  const cashGroup = await contractCall(
    contracts.NOTIONAL.address[appChainId],
    contracts.NOTIONAL.abi,
    provider,
    'getCashGroup',
    [currencyId],
  )

  const market = await contractCall(
    contracts.NOTIONAL.address[appChainId],
    contracts.NOTIONAL.abi,
    provider,
    'getMarket',
    [
      currencyId,
      new Date(collateral?.maturity).getTime() / 1000,
      Math.round(new Date().getTime() / 1000),
    ],
  )

  const RATE_PRECISION = 10 ** 9
  const SECONDS_IN_YEAR = 360 * 86400
  const MAX_MARKET_PROPORTION = (RATE_PRECISION * 99) / 100

  const logProportion = (proportion: any) => {
    if (proportion > MAX_MARKET_PROPORTION) {
      console.log('Insufficient liquidity')
    }
    const ratio = (proportion * RATE_PRECISION) / (RATE_PRECISION - proportion)
    if (ratio < 0) {
      console.log('Insufficient liquidity')
    }
    const logValue = Math.log(ratio / RATE_PRECISION)
    return logValue * RATE_PRECISION
  }

  const interstToExchangeRate = (annualRate: any, timeToMaturity: any) => {
    return (
      Math.exp((annualRate * timeToMaturity) / SECONDS_IN_YEAR / RATE_PRECISION) * RATE_PRECISION
    )
  }

  const exchangeRateFactors = (market: any, rateScalars: any, timeToMaturity: any) => {
    const rateScalar = (rateScalars[0] * SECONDS_IN_YEAR) / timeToMaturity
    if (rateScalar == 0) {
      console.log('Rate scalar divide by zero error')
    }

    const totalCashUnderlying = market[3]
    const lastImpliedRate = market[5]
    const exchangeRate = interstToExchangeRate(lastImpliedRate, timeToMaturity)
    if (exchangeRate < RATE_PRECISION) {
      console.log('Interest rates cannot be negative')
    }

    const proportion = (market[2] * RATE_PRECISION) / (market[2] + market[3])
    const lnProportion = logProportion(proportion)
    const rateAnchor = exchangeRate - (lnProportion * RATE_PRECISION) / rateScalar

    return [rateScalar, totalCashUnderlying, rateAnchor, timeToMaturity, exchangeRate]
  }

  const exchangeRate = (fCashToAccount: any, market: any, cashGroup: any, timeToMaturity: any) => {
    const rateScalars = cashGroup[10]
    const factors = exchangeRateFactors(market, rateScalars, timeToMaturity)
    const proportion = ((market[2] - fCashToAccount) * RATE_PRECISION) / (market[2] + market[3])
    const lnProportion = logProportion(proportion)
    return Number((lnProportion * RATE_PRECISION) / factors[0] + factors[2])
  }

  const remainingTimeToMaturity = (blockTime: any, maturity: any) => {
    return Math.max(0, maturity - blockTime)
  }

  const exchangeToInterestRate = (exchangeRate: any, timeToMaturity: any) => {
    const annualRate =
      ((Math.log(exchangeRate / RATE_PRECISION) * SECONDS_IN_YEAR) / timeToMaturity) *
      RATE_PRECISION
    return Number(annualRate).toFixed(0)
  }

  const minImpliedRate = (
    fCashToAccount: any,
    blockTime: any,
    market: any,
    cashGroup: any,
    maxSlippage: any,
  ) => {
    const maturity = market[1]
    const timeToMaturity = remainingTimeToMaturity(blockTime, maturity)
    const rate = exchangeRate(fCashToAccount, market, cashGroup, timeToMaturity)
    return Number(exchangeToInterestRate(rate, timeToMaturity)) - maxSlippage
  }

  const currentTimestamp = new Date()

  // Might need to remove /RATE_PRECISION
  return minImpliedRate(fCash, currentTimestamp, market, cashGroup, maxSlippage) / RATE_PRECISION
}
