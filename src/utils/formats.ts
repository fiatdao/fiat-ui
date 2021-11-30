import { ZERO_BN } from '../constants/misc'
import { formatUnits } from '@ethersproject/units'
import { BigNumber } from '@ethersproject/bignumber'

export function bigNumberToDecimal(value: BigNumber | null, decimals = 18): number {
  const formattedValue = formatUnits(value || ZERO_BN, decimals)
  return Number(formattedValue)
}

export function formatTokenValue(value: BigNumber | null, tokenDecimals = 18, decimals = 2) {
  const formattedValue = formatUnits(value || ZERO_BN, tokenDecimals)
  return Number(formattedValue).toFixed(decimals)
}
