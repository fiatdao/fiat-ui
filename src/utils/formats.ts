import BigNumber from 'bignumber.js'

export function bigNumberToDecimal(value?: BigNumber.Value, decimals = 18): number {
  const bnValue = BigNumber.from(value ?? 0) as BigNumber
  return bnValue.scaleBy(decimals).toNumber()
}
