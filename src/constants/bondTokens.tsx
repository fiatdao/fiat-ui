import { TokenMeta } from '@/types/token'

const eyUSDC: TokenMeta = {
  protocol: 'Element Finance',
  address: '0xdcf80c068b7ffdf7273d8adae4b076bf384f711a',
  symbol: 'USDC Principal Token',
  decimals: 6,
  name: 'eyUSDC:10-AUG-22-GMT',
}

const bondTokens = [eyUSDC]

export function getTokenByAddress(address: string | null) {
  return bondTokens.find((token) => token.address.toLowerCase() === address?.toLowerCase())
}
