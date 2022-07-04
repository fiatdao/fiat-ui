import {
  DEFAULT_CHAIN_ID,
  RPC_URL_GOERLI,
  RPC_URL_LOCALHOST,
  RPC_URL_MAINNET,
  SUBGRAPH_GOERLI,
  SUBGRAPH_MAINNET,
} from '@/src/constants/misc'
import EthLogo from '@/src/resources/svg/ethereum.svg'

import { ObjectValues } from '@/types/utils'

export const Chains = {
  localhost: 1337,
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
  svg: React.FC
  subgraphApi: string
  contractsDeployed: boolean
  isDev: boolean
}

// Default chain id from env var
export const INITIAL_APP_CHAIN_ID = Number(DEFAULT_CHAIN_ID) as ChainsValues

export const chainsConfig: Record<ChainsValues, ChainConfig> = {
  [Chains.localhost]: {
    id: Chains.mainnet,
    name: 'Localhost Mainnet',
    shortName: 'Localhost Mainnet',
    chainId: Chains.localhost,
    chainIdHex: '0x539',
    rpcUrl: RPC_URL_LOCALHOST,
    blockExplorerUrls: ['https://etherscan.io/'],
    iconUrls: [],
    svg: EthLogo,
    subgraphApi: SUBGRAPH_MAINNET,
    contractsDeployed: true,
    isDev: true,
  },
  [Chains.mainnet]: {
    id: Chains.mainnet,
    name: 'Mainnet',
    shortName: 'Mainnet',
    chainId: Chains.mainnet,
    chainIdHex: '0x1',
    rpcUrl: RPC_URL_MAINNET,
    blockExplorerUrls: ['https://etherscan.io/'],
    iconUrls: [],
    svg: EthLogo,
    subgraphApi: SUBGRAPH_MAINNET,
    contractsDeployed: true,
    isDev: false,
  },
  [Chains.goerli]: {
    id: Chains.goerli,
    name: 'Görli Testnet',
    shortName: 'Goerli',
    chainId: Chains.goerli,
    chainIdHex: '0x5',
    rpcUrl: RPC_URL_GOERLI,
    blockExplorerUrls: ['https://goerli.etherscan.io/'],
    iconUrls: [],
    svg: EthLogo,
    subgraphApi: SUBGRAPH_GOERLI,
    contractsDeployed: true,
    isDev: true,
  },
}

export function getNetworkConfig(chainId: ChainsValues): ChainConfig | undefined {
  const networkConfig = chainsConfig[chainId] ?? undefined

  if (chainId === undefined) {
    console.warn(`No config for unsupported chainId: ${chainId}`)
  }
  return networkConfig
}

export const isValidChain = (chain: any) => {
  const chainConfig = getNetworkConfig(chain)
  return chainConfig ? chainConfig.contractsDeployed : false
}
