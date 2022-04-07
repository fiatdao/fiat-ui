import {
  codex,
  collateralAuction,
  collybus,
  erc20,
  fiat,
  moneta,
  noLossCollateralAuctionActions,
  prbProxy,
  vault20,
  vaultEptActions,
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
  FIAT: {
    address: {
      [Chains.mainnet]: '0x2d9579552cD679943cbBc23BDdd9467840C98c75',
      [Chains.goerli]: '0x391eCE49AD1019041FB6ab5424318e5001Ee55cc',
    },
    abi: fiat,
    decimals: 18,
    symbol: 'FIAT',
    priceTokenId: 'fiat-coin',
  },
  CODEX: {
    address: {
      [Chains.mainnet]: '0xCE0e395cF61D0F836ddd4fC021f009C93DFe3a63',
      [Chains.goerli]: '0x406ADF43ed603a39eae058975235d53d46138033',
    },
    abi: codex,
  },
  COLLYBUS: {
    address: {
      [Chains.mainnet]: '0x6B576f65DE4B8B171aEF412DEBc33dc53500cFdB',
      [Chains.goerli]: '0xd419496FF8f66bdAfDeD859b439aa5807e835d7d',
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
  COLLATERAL_AUCTION: {
    address: {
      [Chains.mainnet]: '0xa50D5B25E29a8FA7E94DA10698fE5100f0eb0cc5',
      [Chains.goerli]: '0x57a5185692DEc513bFe6e5D5ed9ef9FC2f72e01D',
    },
    abi: collateralAuction,
  },
  PRB_Proxy: {
    address: {
      [Chains.mainnet]: '0x6aD36586D91950Cc232f90c4065faA94427955fB',
      [Chains.goerli]: '0xc918902ef2f428f2dc77e3b4b5e5e153aab9d1b0',
    },
    abi: prbProxy,
  },
  USER_ACTIONS_EPT: {
    address: {
      [Chains.mainnet]: '0xa5FD0632ddC2E6ce5c6a83B81730FBf45D80A8b2',
      [Chains.goerli]: '0xb57A76FF53a5DcEa7B344a44c30197C49566F37F',
    },
    abi: vaultEptActions,
  },
  MONETA: {
    address: {
      [Chains.mainnet]: '0xbCC7DaA516aF69F4A8D36fBda8863A125ec05dE8',
      [Chains.goerli]: '0x166d6f37A97A0E1Cf9aDd84065EeA317F85eD0ce',
    },
    abi: moneta,
  },
  NO_LOSS_COLLATERAL_AUCTION_ACTIONS: {
    address: {
      [Chains.mainnet]: '0xF3f2d750a2e1543E376eBd5eE1e7cA0c067fB2ab',
      [Chains.goerli]: '0xed9453aD232FC5cc0D62dc217454735BB9EC7DB4',
    },
    abi: noLossCollateralAuctionActions,
  },
})
