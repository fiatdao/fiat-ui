import { Chains, ChainsValues } from '@/src/constants/chains'
import codex from '@/src/abis/Codex.json'
import collateralAuction from '@/src/abis/CollateralAuction.json'
import collybus from '@/src/abis/Collybus.json'
import erc20 from '@/src/abis/ERC20.json'
import erc1155 from '@/src/abis/ERC1155.json'
import fiat from '@/src/abis/FIAT.json'
import userActions20 from '@/src/abis/UserActions20.json'
import userActions1155 from '@/src/abis/UserActions1155.json'
import vault20 from '@/src/abis/Vault20.json'
import vault1155 from '@/src/abis/Vault1155.json'
import prbProxy from '@/src/abis/PRBProxy.json'
import noLossCollateralAuction from '@/src/abis/NoLossCollateralAuction.json'

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
      [Chains.goerli]: '0xf4054D739592A28559b37D5950B62a18e5ec73DB',
    },
    abi: fiat,
    decimals: 18,
    symbol: 'FIAT',
    priceTokenId: 'fiat-coin',
  },
  CODEX: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0xdB85ee14BD31558C9620da98565622912E725958',
    },
    abi: codex,
  },
  COLLYBUS: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x4B1002aB18D7Ea45125D6F908B3A13f947C3FBF9',
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
      [Chains.goerli]: '0xfeba478B1a0CE24B86F064B51e489D8e79a41Cf0',
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
  USER_ACTIONS_20: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x9372Bf7E30Df8b399eF0b470DCF3C7776C50CFF9',
    },
    abi: userActions20,
  },
  USER_ACTIONS_1155: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x91c5f414DfBC8Af76B13d91E0c5EdcF9Ac39DE66',
    },
    abi: userActions1155,
  },
  USER_ACTIONS_EPT: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0xbd0b3533Af1B728e6cc196976D72Cb966f7bB261',
    },
    abi: [], //Todo missing ABI here
  },
  USER_ACTIONS_FC: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0xe89917847D5603C046C4E556d9A4afD21fa59EA1',
    },
    abi: [], //Todo missing ABI here
  },
  USER_ACTIONS_AUCTIONS: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '', // TODO missing deployed contract here
    },
    abi: [], // Todo missing ABI here
  },
  MONETA: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x21ff8FF98fb7F283aD4943400D6e401aFCA80178',
    },
    abi: [],
  },
  NO_LOSS_COLLATERAL_AUCTION_ACTIONS: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x8D01561B5e4f139336dD3275240129c8507ed581',
    },
    abi: noLossCollateralAuction, // Todo missing ABI here
  },
})
