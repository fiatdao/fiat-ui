import { Collateral } from './data/collaterals'
import { calculateStablecoinBondApr } from './underlyingPositionHelpers'
import { SummaryItem } from '../components/custom/summary'
import { parseDate } from '@/src/utils/dateTime'
import BigNumber from 'bignumber.js'

interface ISummaryBuilder {
  buildMarketRate(marketRate: BigNumber, collateral: Collateral): this
  buildSlippageTolerance(slippageTolerance: number): this
  buildFixedAPR(collateral: Collateral, marketRate: BigNumber): this
  buildInterestEarned(collateral: Collateral, underlierAmount: number, marketRate: BigNumber): this
  buildRedeemableAtMaturity(
    collateral: Collateral,
    underlierAmount: number,
    marketRate: BigNumber,
  ): this
  // buildCurrentFiatDebt(): this
  // buildEstimatedFiatDebt(): this
  // buildCurrentHealthFactor(): this
  // buildEstimatedNewHealthFactor(): this
  // buildCurrentCollateralDeposited(): this
  // buildNewCollateralDeposited(): this
  // buildEstimatedCollateralToDeposit(): this
  // buildEstimatedUnderlierToReceiveDeposit(): this

  getSummary(): Array<SummaryItem>
}

export class SummaryBuilder implements ISummaryBuilder {
  summary: Array<SummaryItem>

  constructor() {
    this.summary = []
  }

  buildMarketRate(marketRate: BigNumber, collateral: Collateral) {
    this.summary.push({
      title: 'Market rate',
      value: `1 Principal Token = ${marketRate.toFixed(4)} ${
        collateral ? collateral.underlierSymbol : '-'
      }`,
    })
    return this
  }

  buildSlippageTolerance(slippageTolerance: number) {
    this.summary.push({
      title: 'Slippage tolerance',
      value: `${slippageTolerance.toFixed(2)}%`,
    })
    return this
  }

  buildFixedAPR(collateral: Collateral, marketRate: BigNumber) {
    const fixedAPR = calculateStablecoinBondApr(collateral, marketRate)
    const fixedAPRStr = `${(fixedAPR * 100).toFixed(2)}%`

    this.summary.push({
      title: 'Fixed APR',
      value: fixedAPRStr,
    })
    return this
  }

  buildInterestEarned(collateral: Collateral, underlierAmount: number, marketRate: BigNumber) {
    const yieldTillMaturity = (1 - marketRate.toNumber()) * 100
    const interestEarned = underlierAmount * (yieldTillMaturity / 100)
    const interestEarnedStr = `${interestEarned.toFixed(2)} ${
      collateral ? collateral.underlierSymbol : '-'
    }`
    this.summary.push({
      title: 'Interest earned',
      value: interestEarnedStr,
    })
    return this
  }

  buildRedeemableAtMaturity(
    collateral: Collateral,
    underlierAmount: number,
    marketRate: BigNumber,
  ) {
    // TODO: refactor out interestEarned val
    const yieldTillMaturity = (1 - marketRate.toNumber()) * 100
    const interestEarned = underlierAmount * (yieldTillMaturity / 100)
    const redeemableValue = underlierAmount + interestEarned

    const redeemable = `${(isNaN(redeemableValue) ? 0 : redeemableValue).toFixed(2)} ${
      collateral ? collateral.underlierSymbol : '-'
    }`

    this.summary.push({
      title: `Redeemable at maturity | ${
        collateral?.maturity ? parseDate(collateral?.maturity) : '--:--:--'
      }`,
      value: redeemable,
    })
    return this
  }

  getSummary() {
    return this.summary
  }
}

// TODO: implement Director for deposit underlier summary, withdraw underlier summary, etc.
