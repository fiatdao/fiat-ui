import { useWeb3Connected } from '@/src/providers/web3ConnectionProvider'
import { contracts } from '@/src/constants/contracts'
import { Contract } from 'ethers'

export const useMinImpliedRate = (fCash: any, maxSlippage: any): any => {
  const { appChainId, web3Provider } = useWeb3Connected()
  const contract = new Contract(
    contracts.USER_ACTIONS_FC.address[appChainId], //probably need to grab a different contract
    contracts.USER_ACTIONS_FC.abi,
    web3Provider?.getSigner(),
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

  const fetchMarket = (market_id: any) => {
    return contract.functions.getMarket(market_id[0], market_id[1], market_id[2])
  }

  // fetch CashGroup details
  const fetchCashGroup = (currencyId: any) => {
    return contract.functions.getCashGroup(currencyId)
  }

  const market_id = [3, 1664064000, 1656288000] // DAI-September-2022

  // fetch market state and CashGroup details
  const market = fetchMarket(market_id)

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
  const cashGroup = fetchCashGroup(market_id[0])

  // Might need to remove /RATE_PRECISION
  return minImpliedRate(fCash, currentTimestamp, market, cashGroup, maxSlippage) / RATE_PRECISION
}
