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
  USER_ACTIONS_20: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x65d5E7FA3F933195FACF76c3565f31A878c79E3C',
    },
    abi: userActions20,
  },
  USER_ACTIONS_1155: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x9EF030cEaC5ad9b7c17549f7e4DB33A2a90EA4DE',
    },
    abi: userActions1155,
  },
})
