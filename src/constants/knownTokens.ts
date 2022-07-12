import { TokenMeta } from '@/types/token'

// FixMe: Create a proper config file Record<KnownTokens, { address: string }>
const config: any = {
  tokens: {},
}

export enum KnownTokens {
  FDT = 'FDT',
  ETH = 'ETH',
  USDC = 'USDC',
  BOND = 'BOND',
  UMA = 'UMA',
  DAI = 'DAI',
  MKR = 'MKR',
  YFI = 'YFI',
  RGT = 'RGT',
  wsOHM = 'wsOHM',
  gOHM = 'gOHM',
  ETH_FDT_SLP = 'ETH_FDT_SLP',
  wsOHM_FDT_SLP = 'wsOHM_FDT_SLP',
  gOHM_FDT_SLP = 'gOHM_FDT_SLP',
}

export const FDTToken: TokenMeta = {
  address: config.tokens.fdt,
  symbol: KnownTokens.FDT,
  name: 'FDT Token',
  decimals: 18,
  icon: 'png/fiat-dao' as any,
  contract: {} as any,
}

export const EthToken: TokenMeta = {
  symbol: KnownTokens.ETH,
  name: 'Ether',
  address: '0x',
  decimals: 18,
  icon: 'token-eth',
  coinGeckoId: 'ethereum',
}

export const UsdcToken: TokenMeta = {
  address: config.tokens.usdc,
  symbol: KnownTokens.USDC,
  name: 'USD Coin',
  decimals: 6,
  icon: 'token-usdc',
  coinGeckoId: 'usd-coin',
  contract: {} as any,
}

export const DaiToken: TokenMeta = {
  address: config.tokens.dai,
  symbol: KnownTokens.DAI,
  name: 'DAI',
  decimals: 18,
  icon: 'token-dai',
  coinGeckoId: 'dai',
  contract: {} as any,
}

export const BondToken: TokenMeta = {
  address: config.tokens.bond,
  symbol: KnownTokens.BOND,
  name: 'BarnBridge',
  decimals: 18,
  icon: 'static/token-bond',
  coinGeckoId: 'barnbridge',
  contract: {} as any,
}

export const UMAToken: TokenMeta = {
  address: config.tokens.uma,
  symbol: KnownTokens.UMA,
  name: 'UMA',
  decimals: 18,
  icon: 'png/uma',
  coinGeckoId: 'uma',
  contract: {} as any,
}

export const MKRToken: TokenMeta = {
  address: config.tokens.mkr,
  symbol: KnownTokens.MKR,
  name: 'MKR',
  decimals: 18,
  icon: 'png/mkr',
  coinGeckoId: 'maker',
  contract: {} as any,
}

export const YFIToken: TokenMeta = {
  address: config.tokens.yfi,
  symbol: KnownTokens.YFI,
  name: 'YFI',
  decimals: 18,
  icon: 'png/YFI',
  coinGeckoId: 'yearn-finance',
  contract: {} as any,
}

export const RGTToken: TokenMeta = {
  address: config.tokens.rgt,
  symbol: KnownTokens.RGT,
  name: 'RGT',
  decimals: 18,
  icon: 'png/rgt',
  coinGeckoId: 'rari-governance-token',
  contract: {} as any,
}

export const wsOHMToken: TokenMeta = {
  address: config.tokens.wsOHM,
  symbol: KnownTokens.wsOHM,
  name: 'wsOHM',
  decimals: 18,
  icon: 'png/wsOHM',
  coinGeckoId: 'wrapped-staked-olympus',
  contract: {} as any,
}

export const gOHMToken: TokenMeta = {
  address: config.tokens.gOHM,
  symbol: KnownTokens.gOHM,
  name: 'gOHM',
  decimals: 18,
  icon: 'png/wsOHM',
  coinGeckoId: 'governance-ohm',
  contract: {} as any,
}

export const EthFdtSLPToken: TokenMeta = {
  address: config.tokens.ethFDTSLP,
  symbol: KnownTokens.ETH_FDT_SLP,
  name: 'ETH FDT SUSHI LP',
  decimals: 18,
  icon: 'png/ETH_FDT_SLP',
  contract: {} as any,
}

export const wsOHMFdtSLPToken: TokenMeta = {
  address: config.tokens.wsOHMFDTSLP,
  symbol: KnownTokens.wsOHM_FDT_SLP,
  name: 'sOHM FDT SUSHI LP',
  decimals: 18,
  icon: 'png/wsOHM_FDT_SUSHI_LP',
  contract: {} as any,
}

export const gOHMFdtSLPToken: TokenMeta = {
  address: config.tokens.gOHMFDTSLP,
  symbol: KnownTokens.gOHM_FDT_SLP,
  name: 'gOHM FDT SUSHI LP',
  decimals: 18,
  icon: 'png/wsOHM_FDT_SUSHI_LP',
  contract: {} as any,
}

export const KNOWN_TOKENS: TokenMeta[] = [
  FDTToken,
  EthToken,
  UsdcToken,
  DaiToken,
  BondToken,
  UMAToken,
  MKRToken,
  YFIToken,
  RGTToken,
  wsOHMToken,
  gOHMToken,
  EthFdtSLPToken,
  wsOHMFdtSLPToken,
  gOHMFdtSLPToken,
]
