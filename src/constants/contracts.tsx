import { Chains, ChainsValues } from '@/src/constants/chains'
import erc20 from '@/src/abis/ERC20.json'
import fiat from '@/src/abis/FIAT.json'
import codex from '@/src/abis/Codex.json'
import collybus from '@/src/abis/Collybus.json'
import limes from '@/src/abis/Limes.json'
import collateralAuction from '@/src/abis/CollateralAuction.json'
import debtAuction from '@/src/abis/DebtAuction.json'
import surplusAuction from '@/src/abis/SurplusAuction.json'
import fiscus from '@/src/abis/Fiscus.json'
import vault20 from '@/src/abis/Vault20.json'
import vaultEPT from '@/src/abis/VaultEPT.json'
import tranche from '@/src/abis/Tranche.json'

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
    decimals: 18,
  },
  FIAT: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x01684fbe1b63b0c06fb0d1564d0675b5546b744c',
    },
    abi: fiat,
    decimals: 18,
    symbol: 'FIAT',
    priceTokenId: 'fiat-coin',
  },
  CODEX: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x44D978D3A6413F0418a255Dd9446369fec9B7a66',
    },
    abi: codex,
  },
  COLLYBUS: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x52702F27CeAde257f03D44f45c36F7467FF2058C',
    },
    abi: collybus,
  },
  LIMES: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x3DcAcb21536EB373D9e67acCd78081F24F5Fc791',
    },
    abi: limes,
  },
  COLLATERAL_AUCTION: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x9973aAc1a7f747583C5981c82Ad95F8614deac33',
    },
    abi: collateralAuction,
  },
  DEBT_AUCTION: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x0b55fAAc36694c0694F5C8f2afF89a43350fAD71',
    },
    abi: debtAuction,
  },
  SURPLUS_AUCTION: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0xbA9789a850E73a691436ba167b85bEf613cAf608',
    },
    abi: surplusAuction,
  },
  FISCUS: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x0953eE8ed1479B026d0FD06ECad11B79b27558aE',
    },
    abi: fiscus,
  },
  VAULT_20: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '',
    },
    abi: vault20,
  },
  VAULT_EPT: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0xeCdB7DC331a8b5117eCF548Fa4730b0dAe76077D',
    },
    abi: vaultEPT,
  },
  TRANCHE: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '',
    },
    abi: tranche,
  },
})
