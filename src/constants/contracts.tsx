import { Chains, ChainsValues } from '@/src/constants/chains'
import erc20 from '@/src/abis/ERC20.json'
import fiat from '@/src/abis/Fiat.json'
import codex from '@/src/abis/Codex.json'
import collybus from '@/src/abis/Collybus.json'
import limes from '@/src/abis/Limes.json'
import collateralAuction from '@/src/abis/CollateralAuction.json'
import debtAuction from '@/src/abis/DebtAuction.json'
import surplusAuction from '@/src/abis/SurplusAuction.json'
import fiscus from '@/src/abis/Fiscus.json'

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
  TEST_ERC20: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x286972E9d9ac56090D5A97A7d9a8F48D8033a668',
    },
    abi: erc20,
    decimals: 6,
    symbol: 'TEST_ERC20',
    priceTokenId: 'fiat-coin',
  },
  USDC: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x08034634bbd210485c9c8f798afdc5432782fd18',
    },
    abi: erc20,
    decimals: 6,
    symbol: 'TEST_ERC20',
    priceTokenId: 'fiat-coin',
  },
  FIAT: {
    address: {
      [Chains.mainnet]: '',
      [Chains.goerli]: '0x18a39fdE0179398b809Cd06a2F6300F65E3198fE',
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
})
