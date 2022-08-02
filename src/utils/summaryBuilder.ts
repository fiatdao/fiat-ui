import { Collateral } from './data/collaterals'
import { calculateStablecoinBondApr } from './underlyingPositionHelpers'
import { getHealthFactorState } from './table'
import { isValidHealthFactor } from './data/positions'
import { SummaryItem } from '../components/custom/summary'
import { getHumanValue } from '../web3/utils'
import {
  EST_FIAT_TOOLTIP_TEXT,
  EST_HEALTH_FACTOR_TOOLTIP_TEXT,
  WAD_DECIMALS,
} from '../constants/misc'
import { DEFAULT_HEALTH_FACTOR } from '../constants/healthFactor'
import { parseDate } from '@/src/utils/dateTime'
import BigNumber from 'bignumber.js'

interface ISummaryBuilder {
  buildEstimatedCollateralToDeposit(
    underlierDepositAmount: BigNumber,
    singleUnderlierToPToken: BigNumber,
    underlierDecimals: number,
  ): this
  buildMarketRate(marketRate: BigNumber, collateral: Collateral): this
  buildSlippageTolerance(slippageTolerance: number): this
  buildEstimatedUnderlierToReceive(estimatedUnderlierToReceive: BigNumber): this
  buildCurrentCollateralDeposited(totalCollateral: BigNumber): this
  buildFixedAPR(collateral: Collateral, marketRate: BigNumber): this
  buildInterestEarned(collateral: Collateral, underlierAmount: number, marketRate: BigNumber): this
  buildRedeemableAtMaturity(
    collateral: Collateral,
    underlierAmount: number,
    marketRate: BigNumber,
  ): this
  buildNewCollateralDeposited(totalCollateral: BigNumber): this
  buildFiatToBeMinted(fiatToBeMinted: BigNumber): this
  buildCurrentFiatDebt(totalDebt: BigNumber): this
  buildEstimatedFiatDebt(newDebt: BigNumber): this
  buildCurrentHealthFactor(currentHealthFactor: BigNumber): this
  buildEstimatedNewHealthFactor(newHealthFactor: BigNumber): this

  getSummary(): Array<SummaryItem>
}

export class SummaryBuilder implements ISummaryBuilder {
  summary: Array<SummaryItem>

  constructor() {
    this.summary = []
  }

  buildEstimatedCollateralToDeposit(
    underlierDepositAmount: BigNumber,
    singleUnderlierToPToken: BigNumber,
    underlierDecimals: number,
  ) {
    const estimatedCollateralToDeposit = underlierDepositAmount.multipliedBy(
      getHumanValue(singleUnderlierToPToken, underlierDecimals),
    )
    this.summary.push({
      title: 'Estimated collateral to deposit',
      value: estimatedCollateralToDeposit.toFixed(2),
    })

    return this
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

  buildEstimatedUnderlierToReceive(estimatedUnderlierToReceive: BigNumber) {
    this.summary.push({
      title: 'Estimated underlier to receive',
      value: estimatedUnderlierToReceive?.toFixed(2),
    })
    return this
  }

  buildCurrentCollateralDeposited(totalCollateral: BigNumber) {
    this.summary.push({
      title: 'Current collateral deposited',
      value: getHumanValue(totalCollateral, WAD_DECIMALS).toFixed(2),
    })
    return this
  }

  buildNewCollateralDeposited(newCollateral: BigNumber) {
    this.summary.push({
      title: 'New collateral deposited',
      value: getHumanValue(newCollateral, WAD_DECIMALS).toFixed(2),
    })
    return this
  }

  buildFiatToBeMinted(fiatToBeMinted: BigNumber): this {
    this.summary.push({
      title: 'FIAT to be minted',
      value: `${fiatToBeMinted.toFixed(4)}`,
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

  buildCurrentFiatDebt(totalDebt: BigNumber) {
    this.summary.push({
      title: 'Current FIAT debt',
      value: getHumanValue(totalDebt, WAD_DECIMALS).toFixed(2),
    })
    return this
  }

  buildEstimatedFiatDebt(newDebt: BigNumber) {
    this.summary.push({
      title: 'Estimated new FIAT debt',
      titleTooltip: EST_FIAT_TOOLTIP_TEXT,
      value: getHumanValue(newDebt, WAD_DECIMALS).toFixed(2),
    })
    return this
  }

  buildCurrentHealthFactor(currentHealthFactor: BigNumber) {
    this.summary.push({
      title: 'Current Health Factor',
      state: getHealthFactorState(currentHealthFactor),
      value: isValidHealthFactor(currentHealthFactor)
        ? currentHealthFactor.toFixed(2)
        : DEFAULT_HEALTH_FACTOR,
    })
    return this
  }

  buildEstimatedNewHealthFactor(newHealthFactor: BigNumber) {
    this.summary.push({
      title: 'Estimated new Health Factor',
      titleTooltip: EST_HEALTH_FACTOR_TOOLTIP_TEXT,
      state: getHealthFactorState(newHealthFactor),
      value: isValidHealthFactor(newHealthFactor)
        ? newHealthFactor.toFixed(2)
        : DEFAULT_HEALTH_FACTOR,
    })
    return this
  }

  getSummary() {
    return this.summary
  }
}
