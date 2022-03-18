import { AddressMappedToken } from '@/types/token'

// Tokens
const eyUSDC = {
  protocol: 'Element Finance',
  symbol: 'USDC Principal Token',
  decimals: 6,
  name: 'eyUSDC:10-AUG-22-GMT',
}

// Address Mappings
const goerliEyUSDC: AddressMappedToken = {
  address: '0xdcf80c068b7ffdf7273d8adae4b076bf384f711a',
  token: eyUSDC,
  chain: 'Goerli',
}

const ethEyUSDC: AddressMappedToken = {
  address: '', // ETH Mainnet token address
  token: eyUSDC,
  chain: 'Etherium',
}

const addressMap: AddressMappedToken[] = [goerliEyUSDC, ethEyUSDC]

export function getTokenByAddress(address: string | null | undefined) {
  return addressMap.find((token) => token.address.toLowerCase() === address?.toLowerCase())?.token
}
