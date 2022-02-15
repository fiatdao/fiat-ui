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
      [Chains.goerli]: '0x8a372c777E96d8B3F3CA85Cf0449d05B822458ff',
    },
    abi: fiat,
    decimals: 18,
    symbol: 'FIAT',
    priceTokenId: 'fiat-coin',
  },
  CODEX: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x3a94FA8FAdbC48D6C4f44149A8b9F668bD510066',
    },
    abi: codex,
  },
  COLLYBUS: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x5438Fd8541135676e990295C1cd62EF779b05Ebb',
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
      [Chains.goerli]: '0x5e17C31f106955E1b6F74eC6716bb62E1f5c2C54',
    },
    abi: collateralAuction,
  },
  USER_ACTIONS_20: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0xf88C65e435446ac54F105C508D246649A4FA1BcC',
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
