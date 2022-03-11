import { TokenMeta } from '@/types/token'

const eyUSDC: TokenMeta = {
  address: '0xdcf80c068b7ffdf7273d8adae4b076bf384f711a',
  symbol: 'Principal Token',
  decimals: 6,
  name: 'eyUSDC:10-AUG-22-GMT',
}

const bondTokens: any = [eyUSDC]

export function getTokenByAddress(address: any): TokenMeta | undefined {
  return bondTokens.find(
    (token: TokenMeta) => token.address.toLowerCase() === address.toLowerCase(),
  )
}
