import { formatUnits } from '@ethersproject/units'
import { BigNumberish } from '@ethersproject/bignumber'
import { ZERO_BN } from '@/src/constants/misc'

export function bigNumberToDecimal(value: BigNumberish | null, decimals = 18): number {
  const formattedValue = formatUnits(value || ZERO_BN, decimals)
  return Number(formattedValue)
}

export function formatTokenValue(value: BigNumberish | null, tokenDecimals = 18, decimals = 2) {
  const formattedValue = formatUnits(value || ZERO_BN, tokenDecimals)
  return Number(formattedValue).toFixed(decimals)
}
