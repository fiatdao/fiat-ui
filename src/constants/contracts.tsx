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
      [Chains.goerli]: '0x9BcC891e4FD371990E31e987be67C3da855c472e',
    },
    abi: fiat,
    decimals: 18,
    symbol: 'FIAT',
    priceTokenId: 'fiat-coin',
  },
  CODEX: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x199837D2E8834106f32703B606E8c6961978e178',
    },
    abi: codex,
  },
  COLLYBUS: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x1079dF8cA1ae5E08a8F91311B3d9908424CcfBDa',
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
      [Chains.goerli]: '0x3A0502A68B11A5B3932c54d62227d5984f640343',
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
      [Chains.goerli]: '0x2b01Fedb50576AA898BEEC4C6E51970185e57Ac9',
    },
    abi: vaultEptActions,
  },
  USER_ACTIONS_FC: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x0C40003650581921BBD2015C7bEc458324fEEfe0',
    },
    abi: vaultFcActions,
  },
  MONETA: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x89dBc61eB0c19d0170A3bC18D181F146602bD9B4',
    },
    abi: moneta,
  },
  NO_LOSS_COLLATERAL_AUCTION_ACTIONS: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x1FbBb4514185f669fc6e270cb109fC96c6A0C2D3',
    },
    abi: noLossCollateralAuctionActions,
  },
})
