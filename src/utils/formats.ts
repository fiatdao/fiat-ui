import BigNumber from 'bignumber.js'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'

export function bigNumberToDecimal(value?: BigNumber.Value, decimals = 18): number {
  const bnValue = BigNumber.from(value ?? ZERO_BIG_NUMBER) as BigNumber
  return bnValue.times(`1e${decimals}`).toNumber()
}
