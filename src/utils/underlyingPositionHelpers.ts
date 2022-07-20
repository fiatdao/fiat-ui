import { Collateral } from '@/src/utils/data/collaterals'
import { parseDate } from '@/src/utils/dateTime'
import { ONE_YEAR_IN_SECONDS } from '@/src/constants/misc'
import BigNumber from 'bignumber.js'

// Adapted from element's calculation of APR
// https://github.com/element-fi/frontend-monorepo/blob/d2654490d04a6584f878c9f62febac25f6bd5a11/apps/core-frontend/src/ui/pools/hooks/usePrincipalTokenYield.ts#L37
const calculateStablecoinBondApr = (collateral: Collateral, marketRate: BigNumber): number => {
  const { maturity } = collateral
  const principalPrice = marketRate.toNumber() ?? 0
  const unlockTimestamp = maturity.getTime() / 1000 // convert ms to secs
  const timeLeftInSeconds = unlockTimestamp - Math.round(Date.now() / 1000)

  // principalPrice is the price in terms of the base asset.  Since we know the principal will be
  // equal to base at term, (1 - principalPrice) gives us the the fixed interest for the rest of
  // the term.  so we take that number and scale up to a year for APY:
  //
  // fixed apy = fixed interest * one_year / term_length
  // const principalPrice = 0.9953283704817295
  let fixedAPR = 0
  if (timeLeftInSeconds > 0) {
    fixedAPR = (((1 - principalPrice) / principalPrice) * ONE_YEAR_IN_SECONDS) / timeLeftInSeconds
  }

  return fixedAPR
}

export function getUnderlyingDataSummary(
  marketRate: BigNumber,
  slippageTolerance: number,
  collateral: Collateral,
  underlierAmount: number,
) {
  const fixedAPR = calculateStablecoinBondApr(collateral, marketRate)
  const fixedAPRStr = `${(fixedAPR * 100).toFixed(2)}%`

  const yieldTillMaturity = (1 - marketRate.toNumber()) * 100
  const interestEarned = underlierAmount * (yieldTillMaturity / 100)
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
      value: fixedAPRStr,
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
