import { contractsByNetwork } from '../../metadata'
import { erc1155, vaultFcActions } from '../abis'
import {
  codex,
  collybus,
  erc20,
  fiat,
  moneta,
  noLossCollateralAuction,
  noLossCollateralAuctionActions,
  notional,
  prbProxy,
  prbProxyRegistry,
  publican,
  vault20,
  vaultEptActions,
  vaultFyActions,
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
      [Chains.localhost]: '',
      [Chains.mainnet]: '',
      [Chains.goerli]: '',
    },
    abi: erc20,
  },
  ERC_1155: {
    address: {
      [Chains.localhost]: '',
      [Chains.mainnet]: '',
      [Chains.goerli]: '',
    },
    abi: erc1155,
  },
  FIAT: {
    address: {
      [Chains.localhost]: contractsByNetwork[Chains.mainnet].fiat.address,
      [Chains.mainnet]: contractsByNetwork[Chains.mainnet].fiat.address,
      [Chains.goerli]: contractsByNetwork[Chains.goerli].fiat.address,
    },
    abi: fiat,
    decimals: 18,
    symbol: 'FIAT',
    priceTokenId: 'fiat-coin',
  },
  FIAT_DAO: {
    address: {
      [Chains.localhost]: '0xed1480d12be41d92f36f5f7bdd88212e381a3677',
      [Chains.mainnet]: '0xed1480d12be41d92f36f5f7bdd88212e381a3677',
      [Chains.goerli]: '0xe10afb811c4ea6d5fd99aa48b0a894401c5cd72c',
    },
    abi: [],
    decimals: 18,
    symbol: 'FDT',
  },
  CODEX: {
    address: {
      [Chains.localhost]: contractsByNetwork[Chains.mainnet].codex.address,
      [Chains.mainnet]: contractsByNetwork[Chains.mainnet].codex.address,
      [Chains.goerli]: contractsByNetwork[Chains.goerli].codex.address,
    },
    abi: codex,
  },
  COLLYBUS: {
    address: {
      [Chains.localhost]: contractsByNetwork[Chains.mainnet].collybus.address,
      [Chains.mainnet]: contractsByNetwork[Chains.mainnet].collybus.address,
      [Chains.goerli]: contractsByNetwork[Chains.goerli].collybus.address,
    },
    abi: collybus,
  },
  VAULT_20: {
    address: {
      [Chains.localhost]: '',
      [Chains.mainnet]: '',
      [Chains.goerli]: '',
    },
    abi: vault20,
  },
  NO_LOSS_COLLATERAL_AUCTION: {
    address: {
      [Chains.localhost]: contractsByNetwork[Chains.mainnet].collateralAuction.address,
      [Chains.mainnet]: contractsByNetwork[Chains.mainnet].collateralAuction.address,
      [Chains.goerli]: contractsByNetwork[Chains.goerli].collateralAuction.address,
    },
    abi: noLossCollateralAuction,
  },
  PRB_PROXY: {
    address: {
      [Chains.localhost]: '',
      [Chains.mainnet]: '',
      [Chains.goerli]: '',
    },
    abi: prbProxy,
  },
  PRB_PROXY_REGISTRY: {
    address: {
      [Chains.localhost]: contractsByNetwork[Chains.mainnet].proxyRegistry.address,
      [Chains.mainnet]: contractsByNetwork[Chains.mainnet].proxyRegistry.address,
      [Chains.goerli]: contractsByNetwork[Chains.goerli].proxyRegistry.address,
    },
    abi: prbProxyRegistry,
  },
  USER_ACTIONS_EPT: {
    address: {
      [Chains.localhost]: contractsByNetwork[Chains.mainnet].vaultEPTActions.address,
      [Chains.mainnet]: contractsByNetwork[Chains.mainnet].vaultEPTActions.address,
      [Chains.goerli]: contractsByNetwork[Chains.goerli].vaultEPTActions.address,
    },
    abi: vaultEptActions,
  },
  USER_ACTIONS_FC: {
    address: {
      [Chains.localhost]: contractsByNetwork[Chains.mainnet].vaultFCActions.address,
      [Chains.mainnet]: contractsByNetwork[Chains.mainnet].vaultFCActions.address,
      [Chains.goerli]: contractsByNetwork[Chains.goerli].vaultFCActions.address,
    },
    abi: vaultFcActions,
  },
  USER_ACTIONS_FY: {
    address: {
      [Chains.localhost]: contractsByNetwork[Chains.mainnet].vaultFYActions.address,
      [Chains.mainnet]: contractsByNetwork[Chains.mainnet].vaultFYActions.address,
      [Chains.goerli]: contractsByNetwork[Chains.goerli].vaultFYActions.address,
    },
    abi: vaultFyActions,
  },
  MONETA: {
    address: {
      [Chains.localhost]: contractsByNetwork[Chains.mainnet].moneta.address,
      [Chains.mainnet]: contractsByNetwork[Chains.mainnet].moneta.address,
      [Chains.goerli]: contractsByNetwork[Chains.goerli].moneta.address,
    },
    abi: moneta,
  },
  NO_LOSS_COLLATERAL_AUCTION_ACTIONS: {
    address: {
      [Chains.localhost]: contractsByNetwork[Chains.mainnet].noLossCollateralAuctionActions.address,
      [Chains.mainnet]: contractsByNetwork[Chains.mainnet].noLossCollateralAuctionActions.address,
      [Chains.goerli]: contractsByNetwork[Chains.goerli].noLossCollateralAuctionActions.address,
    },
    abi: noLossCollateralAuctionActions,
  },
  PUBLICAN: {
    address: {
      [Chains.localhost]: contractsByNetwork[Chains.mainnet].publican.address,
      [Chains.mainnet]: contractsByNetwork[Chains.mainnet].publican.address,
      [Chains.goerli]: contractsByNetwork[Chains.goerli].publican.address,
    },
    abi: publican,
  },
  NOTIONAL: {
    address: {
      [Chains.mainnet]: contractsByNetwork[Chains.mainnet].notional.address,
      [Chains.goerli]: contractsByNetwork[Chains.goerli].notional.address,
    },
    abi: notional,
  },
})
