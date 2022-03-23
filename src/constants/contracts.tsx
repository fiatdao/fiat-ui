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
      [Chains.goerli]: '0xeA8B4F3df3b7628A618a06A372EdC310DBdEd950',
    },
    abi: fiat,
    decimals: 18,
    symbol: 'FIAT',
    priceTokenId: 'fiat-coin',
  },
  CODEX: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x46ae7f3b5B9b32231F1e88df806672a182FbdA0C',
    },
    abi: codex,
  },
  COLLYBUS: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0xcaF187fBF3137dA36a10A72c77d1A68a6986B710',
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
      [Chains.goerli]: '0xEeF8e029bA352D90Ffa3b0d85E0bf9f88280a0e5',
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
      [Chains.goerli]: '0x7577970ab2bc78f59b2be80942551b194d6a7dbd',
    },
    abi: vaultEptActions,
  },
  USER_ACTIONS_FC: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x3DAe16D9e96413AFCB01324c01f53912A887c289',
    },
    abi: vaultFcActions,
  },
  MONETA: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x13a60380e65EC30f4d1897204306E10cf890d936',
    },
    abi: moneta,
  },
  NO_LOSS_COLLATERAL_AUCTION_ACTIONS: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x0978DaA4Bf9AA2A99021b672f955F16d8caD590a',
    },
    abi: noLossCollateralAuctionActions,
  },
})
