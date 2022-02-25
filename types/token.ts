import BigNumber from 'bignumber.js'
import { TokenIconNames } from '@/src/components/custom/icon'

export type TokenData = {
  symbol: string
  address: string
  decimals: number
}

export type TokenMeta = TokenData & {
  name: string
  icon?: TokenIconNames
  coinGeckoId?: string
  contract?: any
  price?: BigNumber
}
