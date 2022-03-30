import BigNumber from 'bignumber.js'
import { SECONDS_IN_A_YEAR, ZERO_BIG_NUMBER } from '@/src/constants/misc'

BigNumber.prototype.scaleBy = function (decimals: any = 0): any {
  return this.multipliedBy(10 ** decimals)
}

BigNumber.prototype.unscaleBy = function (decimals: any = 0): any {
  return this.dividedBy(10 ** decimals)
}

BigNumber.from = (value: any): any => {
  if (value === undefined || value === null) {
    return undefined
  }

  const bnValue = new BigNumber(value)

  if (bnValue.isNaN()) {
    return undefined
  }

  return bnValue
}

BigNumber.ZERO = BigNumber.from(0)

BigNumber.sumEach = <T = any>(
  items: T[],
  predicate: (item: T) => BigNumber | undefined,
): BigNumber | undefined => {
  let sum = BigNumber.ZERO

  for (const item of items) {
    const val = predicate?.(item)

    if (!val || val.isNaN()) {
      return undefined
    }

    sum = sum.plus(val)
  }

  return sum
}

export function getEtherscanTxUrl(txHash?: string, chainId = 42): string | undefined {
  if (txHash) {
    switch (chainId) {
      case 1:
        return `https://etherscan.io/tx/${txHash}`
      case 4:
        return `https://rinkeby.etherscan.io/tx/${txHash}`
      case 5:
        return `https://goerli.etherscan.io/tx/${txHash}`
      case 42:
        return `https://kovan.etherscan.io/tx/${txHash}`
      default:
    }
  }

  return undefined
}

export function getEtherscanAddressUrl(address?: string, chainId = 42): string | undefined {
  if (address) {
    switch (chainId) {
      case 1:
        return `https://etherscan.io/address/${address}`
      case 4:
        return `https://rinkeby.etherscan.io/address/${address}`
      case 5:
        return `https://goerli.etherscan.io/address/${address}`
      case 42:
        return `https://kovan.etherscan.io/address/${address}`
      default:
    }
  }

  return undefined
}

export function getHumanValue(value: number | BigNumber, decimals?: number): BigNumber
export function getHumanValue(value?: BigNumber.Value, decimals?: number): BigNumber
export function getHumanValue(value: any, decimals: any = 0): any {
  return value ? BigNumber.from(value)?.unscaleBy(decimals) : ZERO_BIG_NUMBER
}

export function getNonHumanValue(value: number | BigNumber, decimals?: number): BigNumber
export function getNonHumanValue(value?: BigNumber.Value, decimals?: number): BigNumber | undefined
export function getNonHumanValue(value: any, decimals: any = 0): any {
  return value ? BigNumber.from(value)?.scaleBy(decimals) : undefined
}

// Converts interest rate from "per second return rate" to APR
export function perSecondToAPR(value: BigNumber): number {
  return (Math.pow(value.toNumber(), SECONDS_IN_A_YEAR) - 1) * 100
}

export function formatBigValue(
  value?: BigNumber | number,
  decimals = 4,
  defaultValue = '-',
  minDecimals: number | undefined = undefined,
): string {
  if (value === undefined) {
    return defaultValue
  }

  const bnValue = new BigNumber(value)

  if (bnValue.isNaN()) {
    return defaultValue
  }

  return new BigNumber(bnValue.toFixed(decimals)).toFormat(minDecimals)
}

type FormatNumberOptions = {
  decimals?: number
}

export function formatNumber(
  value: number | BigNumber | undefined,
  options?: FormatNumberOptions,
): string | undefined {
  if (value === undefined || Number.isNaN(value)) {
    return undefined
  }

  const { decimals } = options ?? {}

  const val = BigNumber.isBigNumber(value) ? value.toNumber() : value

  return Intl.NumberFormat('en', {
    maximumFractionDigits: decimals,
  }).format(val)
}

export function formatPercent(
  value: number | BigNumber | undefined,
  decimals = 2,
): string | undefined {
  if (value === undefined || Number.isNaN(value)) {
    return undefined
  }

  const rate = BigNumber.isBigNumber(value) ? value.toNumber() : value

  return (
    Intl.NumberFormat('en', {
      maximumFractionDigits: decimals,
    }).format(rate * 100) + '%'
  )
}

type FormatTokenOptions = {
  tokenName?: string
  decimals?: number
  minDecimals?: number
  maxDecimals?: number
  scale?: number
  compact?: boolean
}

export function formatToken(
  value: number | BigNumber | undefined,
  options?: FormatTokenOptions,
): string | undefined {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return undefined
  }

  let val = new BigNumber(value)

  if (val.isNaN()) {
    return undefined
  }

  if (options) {
    // eslint-disable-next-line no-prototype-builtins
    if (options.hasOwnProperty('scale') && options.scale === undefined) {
      return undefined
    }
  }

  const { compact = false, decimals = 4, minDecimals, scale = 0, tokenName } = options ?? {}

  if (scale > 0) {
    val = val.unscaleBy(scale)!
  }

  let str = ''

  if (compact) {
    str = Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(val.toNumber())
  } else {
    str = new BigNumber(val.toFixed(decimals)).toFormat(minDecimals)
  }

  return tokenName ? `${str} ${tokenName}` : str
}

type FormatUSDOptions = {
  decimals?: number
  compact?: boolean
}

export function formatUSD(
  value: number | BigNumber | string | undefined,
  options?: FormatUSDOptions,
): string | undefined {
  let val = value

  if (val === undefined || val === null) {
    return undefined
  }

  if (typeof val === 'string') {
    val = Number(val)
  }

  if (BigNumber.isBigNumber(val)) {
    if (val.isNaN()) {
      return undefined
    }
  } else if (typeof val === 'number') {
    if (!Number.isFinite(val)) {
      return undefined
    }
  }

  const { compact = false, decimals = 2 } = options ?? {}

  if (0 > decimals || decimals > 20) {
    console.trace(`Decimals value is out of range 0..20 (value: ${decimals})`)
    return undefined
  }

  let str = ''

  if (compact) {
    str = Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: decimals !== 0 ? decimals : undefined,
    }).format(BigNumber.isBigNumber(val) ? val.toNumber() : val)
  } else {
    str = new BigNumber(val.toFixed(decimals)).toFormat(decimals)
  }

  return `$${str}`
}

export function formatUSDValue(
  value?: BigNumber | number,
  decimals = 2,
  minDecimals: number = decimals,
): string {
  if (value === undefined) {
    return '-'
  }

  const val = BigNumber.isBigNumber(value) ? value : new BigNumber(value)
  const formattedValue = formatBigValue(val.abs(), decimals, '-', minDecimals)

  return val.isPositive() ? `$${formattedValue}` : `-$${formattedValue}`
}

export function shortenAddr(addr: string | undefined, first = 6, last = 4): string | undefined {
  return addr ? [String(addr).slice(0, first), String(addr).slice(-last)].join('...') : undefined
}
