import {
  codex,
  collybus,
  erc20,
  fiat,
  moneta,
  noLossCollateralAuction,
  noLossCollateralAuctionActions,
  prbProxyRegistry,
  prbProxy,
  publican,
  vault20,
  vaultEptActions,
} from '@/src/abis'
import { Chains, ChainsValues } from '@/src/constants/chains'

type BaseAppContractInfo = {
  abi: any[]
  decimals?: number
  icon?: JSX.Element
  symbol?: string
  priceTokenId?: string
}

export type ChainAppContractInfo = BaseAppContractInfo & {
  address: string
}

export type AppContractInfo = BaseAppContractInfo & {
  address: { [key in ChainsValues]: string }
}

function constantContracts<T extends { [key in string]: AppContractInfo }>(o: T): T {
  return o
}

export const contracts = constantContracts({
  ERC_20: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '',
    },
    abi: erc20,
  },
  FIAT: {
    address: {
      [Chains.mainnet]: '0x586Aa273F262909EEF8fA02d90Ab65F5015e0516',
      [Chains.goerli]: '0x7c9571148968d05608d324463E38F04a7eAAd53e',
    },
    abi: fiat,
    decimals: 18,
    symbol: 'FIAT',
    priceTokenId: 'fiat-coin',
  },
  CODEX: {
    address: {
      [Chains.mainnet]: '0x6bF5EB06201e4ea7C315b1C23BfE79fAE30541F9',
      [Chains.goerli]: '0x56974fC4bB4Dc18dDDa06B2056f1Bdfef0eCA0FF',
    },
    abi: codex,
  },
  COLLYBUS: {
    address: {
      [Chains.mainnet]: '0xD503383fFABbec8Eb85eAED448fE1fFEc0a8148A',
      [Chains.goerli]: '0xB894853D5771B588530394065D44A33BcB314aC5',
    },
    abi: collybus,
  },
  VAULT_20: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '',
    },
    abi: vault20,
  },
  NO_LOSS_COLLATERAL_AUCTION: {
    address: {
      [Chains.mainnet]: '0x69E65740a4db91e7e18c69A2180251Cf929E035E',
      [Chains.goerli]: '0x2651d4Bf4EDe0A65d3439f10e69dCe419d9e63D9',
    },
    abi: noLossCollateralAuction,
  },
  PRB_PROXY: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '',
    },
    abi: prbProxy,
  },
  PRB_PROXY_REGISTRY: {
    address: {
      [Chains.mainnet]: '0x9b6e12B5d59339a2cA34Af36455BF0A0396069C6',
      [Chains.goerli]: '0xc918902ef2f428f2dc77e3b4b5e5e153aab9d1b0',
    },
    abi: prbProxyRegistry,
  },
  USER_ACTIONS_EPT: {
    address: {
      [Chains.mainnet]: '0x0021DCEeb93130059C2BbBa7DacF14fe34aFF23c',
      [Chains.goerli]: '0xEEf2b5B29007FDCd31b9961a1D2691b69B3640aa',
    },
    abi: vaultEptActions,
  },
  MONETA: {
    address: {
      [Chains.mainnet]: '0xEA8Efd605845F4cFAa8Ee6c757390196E1b3f736',
      [Chains.goerli]: '0xacB75532D1D83321f9B95f9b1eE6Bf3F9c2c475D',
    },
    abi: moneta,
  },
  NO_LOSS_COLLATERAL_AUCTION_ACTIONS: {
    address: {
      [Chains.mainnet]: '0x8ec9d8Af2C0922c5c39388148C136f31E07209Bd',
      [Chains.goerli]: '0x72614e33ba8fBE89ff2c7c6Edf8c56D43f51E577',
    },
    abi: noLossCollateralAuctionActions,
  },
  PUBLICAN: {
    address: {
      [Chains.mainnet]: '0x3fF548c77A82B377258b5220164E7Ae267eD8978',
      [Chains.goerli]: '0x9278785Fd998f527B2dBad2ed83d18a69DD50C14',
    },
    abi: publican,
  },
})
