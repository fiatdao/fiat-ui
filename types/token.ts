import { TokenIconNames } from '@/src/components/custom/icon'
import BigNumber from 'bignumber.js'

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
  protocol?: string
}

export type AddressMappedToken = {
  address: string
  token: {
    protocol: string
    symbol: string
    decimals: number
    name: string
  }
  chain: string
}
