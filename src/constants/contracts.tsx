import { Chains, ChainsValues } from '@/src/constants/chains'
import erc20 from '@/src/abis/ERC20.json'

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
  FIAT: {
    address: {
      [Chains.mainnet]: '',
      [Chains.rinkeby]: '',
    },
    abi: erc20,
    decimals: 6,
    symbol: 'FIAT',
    priceTokenId: 'fiat-coin',
  },
})
