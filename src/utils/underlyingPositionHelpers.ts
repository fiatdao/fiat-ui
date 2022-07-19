import { Collateral } from '@/src/utils/data/collaterals'
import { parseDate } from '@/src/utils/dateTime'
import BigNumber from 'bignumber.js'

export function getUnderlyingDataSummary(
  marketRate: BigNumber,
  slippageTolerance: number,
  collateral: Collateral,
  underlierAmount: number,
) {
  const apr = (1 - marketRate.toNumber()) * 100
  const fixedAPR = `${apr.toFixed(2)}%`

  const interestEarned = underlierAmount * (apr / 100)
  const interestEarnedStr = `${interestEarned.toFixed(2)} ${
    collateral ? collateral.underlierSymbol : '-'
  }`

  const redeemableValue = underlierAmount + interestEarned
  const redeemable = `${(isNaN(redeemableValue) ? 0 : redeemableValue).toFixed(2)} ${
    collateral ? collateral.underlierSymbol : '-'
  }`

  return [
    {
      title: 'Market rate',
      value: `1 Principal Token = ${marketRate.toFixed(4)} ${
        collateral ? collateral.underlierSymbol : '-'
      }`,
    },
    // {
    //   title: 'Price impact',
    //   value: `${priceImpact.toFixed(2)}%`,
    // },
    {
      title: 'Slippage tolerance',
      value: `${slippageTolerance.toFixed(2)}%`,
    },
    {
      title: 'Fixed APR',
      value: fixedAPR,
    },
    {
      title: 'Interest earned',
      value: interestEarnedStr,
    },
    {
      title: `Redeemable at maturity | ${
        collateral?.maturity ? parseDate(collateral?.maturity) : '--:--:--'
      }`,
      value: redeemable,
    },
  ]
}
