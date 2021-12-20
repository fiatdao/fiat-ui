import nullthrows from 'nullthrows'

import { ObjectValues } from '@/types/utils'

export const Chains = {
  mainnet: 1,
  // rinkeby: 4,
  goerli: 5,
  //kovan: 42,
  //optimismn: 10
  //optimismKovan: 69
  //local: 31337
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
    //openseaURL: 'https://opensea.io/assets/0x1',
    iconUrls: [],
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
  },
  // [Chains.rinkeby]: {
  //   id: Chains.rinkeby,
  //   name: 'Rinkeby',
  //   shortName: 'Rinkeby',
  //   chainId: Chains.rinkeby,
  //   chainIdHex: '0x4',
  //   rpcUrl: 'https://rinkeby.infura.io/v3/ecb81cbe2f03436cb39236e4160311fe',
  //   blockExplorerUrls: ['https://rinkeby.etherscan.io/'],
  //   iconUrls: [],
  // },
  // [Chains.kovan]: {
  //   id: Chains.kovan,
  //   name: 'Kovan',
  //   shortName: 'Kovan',
  //   chainId: Chains.kovan,
  //   chainIdHex: '0x2a',
  //   rpcUrl: 'https://kovan.infura.io/v3/ecb81cbe2f03436cb39236e4160311fe',
  //   blockExplorerUrls: ['https://kovan.etherscan.io/'],
  //   iconUrls: [],
  // },
  // [ChainId.OptimismMainnet]: {
  //   id: ChainStringId.OptimismMainnet,
  //   name: "Optimism",
  //   shortName: "Optimism",
  //   chainId: 10,
  //   chainIdHex: "0xa",
  //   rpcUrl: "https://mainnet.optimism.io",
  //   blockExplorerUrls: ["https://optimistic.etherscan.io/"],
  //   iconUrls: [
  //     "https://optimism.io/images/metamask_icon.svg",
  //     "https://optimism.io/images/metamask_icon.png",
  //   ],
  // },
  // [ChainId.OptimismKovan]: {
  //   id: ChainStringId.OptimismKovan,
  //   name: "Optimistic Kovan",
  //   shortName: "Optimism",
  //   chainId: 69,
  //   chainIdHex: "0x45",
  //   rpcUrl: "https://kovan.optimism.io",
  //   blockExplorerUrls: ["https://kovan-explorer.optimism.io/"],
  //   iconUrls: [
  //     "https://optimism.io/images/metamask_icon.svg",
  //     "https://optimism.io/images/metamask_icon.png",
  //   ],
  // },
  // [ChainId.Local]: {
  //   id: ChainStringId.Local,
  //   name: "Local",
  //   shortName: "Local",
  //   chainId: ChainId.Local,
  //   chainIdHex: "0x539",
  //   rpcUrl: "http://0.0.0.0:8545",
  //   blockExplorerUrls: ["https://kovan-explorer.optimism.io/"],
  //   iconUrls: [
  //     "https://optimism.io/images/metamask_icon.svg",
  //     "https://optimism.io/images/metamask_icon.png",
  //   ],
  // },
}

export function getNetworkConfig(chainId: ChainsValues): ChainConfig {
  const networkConfig = chainsConfig[chainId]
  return nullthrows(networkConfig, `No config for chain id: ${chainId}`)
}
