import {
  codex,
  collateralAuction,
  collybus,
  erc1155,
  erc20,
  fiat,
  moneta,
  noLossCollateralAuctionActions,
  prbProxy,
  vault1155,
  vault20,
  vaultEptActions,
  vaultFcActions,
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
  ERC_1155: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '',
    },
    abi: erc1155,
  },
  FIAT: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x004e84d9eea17Bdad2912B475f7C473064A3Ca1C',
    },
    abi: fiat,
    decimals: 18,
    symbol: 'FIAT',
    priceTokenId: 'fiat-coin',
  },
  CODEX: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0xBB789154514c0E04CA40b988a2Fa94AF1b80a840',
    },
    abi: codex,
  },
  COLLYBUS: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0xe1c58e1BAD975b4882902783Ca458B6719aE3533',
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
  VAULT_1155: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '',
    },
    abi: vault1155,
  },
  COLLATERAL_AUCTION: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x4e21296DB6366dF6380C34a5bd47e79C80231E16',
    },
    abi: collateralAuction,
  },
  PRB_Proxy: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0xc918902ef2f428f2dc77e3b4b5e5e153aab9d1b0',
    },
    abi: prbProxy,
  },
  USER_ACTIONS_EPT: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x99D9ad4C752b7499B4C45c1c72B3E3bb2298305D',
    },
    abi: vaultEptActions,
  },
  USER_ACTIONS_FC: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x67ab5F4F18078a238A2428e73d45A6385C5F5a49',
    },
    abi: vaultFcActions,
  },
  MONETA: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0xA9387089A3863F9160099257ad3368245796D980',
    },
    abi: moneta,
  },
  NO_LOSS_COLLATERAL_AUCTION_ACTIONS: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0xa9fE97897fCa0E9F80AF844AC2E1ccc780ff4aF0',
    },
    abi: noLossCollateralAuctionActions,
  },
})
