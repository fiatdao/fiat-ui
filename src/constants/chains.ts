import nullthrows from 'nullthrows'

import { ObjectValues } from '@/types/utils'

export const Chains = {
  mainnet: 1,
  goerli: 5,
} as const

export type ChainsValues = ObjectValues<typeof Chains>
export type ChainsKeys = keyof typeof Chains

export type ChainConfig = {
  id: ChainsValues
  name: string
  shortName: string
  chainId: ChainsValues
  chainIdHex: string
  rpcUrl: string
  blockExplorerUrls: string[]
  iconUrls: string[]
  constractsDeployed: boolean
}

export const chainsConfig: Record<ChainsValues, ChainConfig> = {
  [Chains.mainnet]: {
    id: Chains.mainnet,
    name: 'Mainnet',
    shortName: 'Mainnet',
    chainId: Chains.mainnet,
    chainIdHex: '0x1',
    rpcUrl: 'https://main-light.eth.linkpool.io',
    blockExplorerUrls: ['https://etherscan.io/'],
    iconUrls: [],
    constractsDeployed: false,
  },
  [Chains.goerli]: {
    id: Chains.goerli,
    name: 'Görli Testnet',
    shortName: 'Goerli',
    chainId: Chains.goerli,
    chainIdHex: '0x5',
    rpcUrl: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    blockExplorerUrls: ['https://goerli.etherscan.io/'],
    iconUrls: [],
    constractsDeployed: true,
  },
}

export function getNetworkConfig(chainId: ChainsValues): ChainConfig {
  const networkConfig = chainsConfig[chainId]
  return nullthrows(networkConfig, `No config for chain id: ${chainId}`)
}
