import { Maybe } from '@/types/utils'

const addresses = {
  deployer: {
    address: '0xec761033FB0Cc9AABCADF91070a9fB273E1b01fc',
    constructorArgs: [],
  },
  aerFactory: {
    address: '0x5A7c13cA6DA6bdE3F11ABADc67B01Fc26438b4E4',
    constructorArgs: [],
  },
  codexFactory: {
    address: '0x22782156ed1DFB9e3C5c0F5e10CaF38929f29Cc6',
    constructorArgs: [],
  },
  collateralAuctionFactory: {
    address: '0xF8205De1fBBF28D9EE3f2806837264FAD7B70D6b',
    constructorArgs: [],
  },
  collybusFactory: {
    address: '0xa54ddB3BB90CB2449ee00779dCB582047871522A',
    constructorArgs: [],
  },
  debtAuctionFactory: {
    address: '0x0EBa1FF698E71d327095967433260a678dB99e2A',
    constructorArgs: [],
  },
  fiatFactory: {
    address: '0x337D29e4536275ad17fAAeCBf5E429e7750b5aB9',
    constructorArgs: [],
  },
  limesFactory: {
    address: '0xE6d681bEc6600F182bB7A53f147562c61F01442E',
    constructorArgs: [],
  },
  monetaFactory: {
    address: '0xcB5339ECA06d1df3004b69238c7dD14771534772',
    constructorArgs: [],
  },
  priceCalculatorFactory: {
    address: '0x85d85722f8171c75F151872579398821Cf739beb',
    constructorArgs: [],
  },
  publicanFactory: {
    address: '0x7fF2c6848670393a343d1215F2fe77916CA15817',
    constructorArgs: [],
  },
  surplusAuctionFactory: {
    address: '0x9448a9e997F161DC1Eb2747F9323Aa694129B353',
    constructorArgs: [],
  },
  tenebraeFactory: {
    address: '0x601cb9BF17CD570cd333020cBfdF31F08a6901Ad',
    constructorArgs: [],
  },
  aer: {
    address: '0x60D90FbEC50933f13d0DFeD41cd380ffe357ABf7',
    constructorArgs: [
      '0xCE0e395cF61D0F836ddd4fC021f009C93DFe3a63',
      '0x6d1EC06167205ECedc84cF46bF4fb265679FEBc9',
      '0x68D8842fE9Ff77942ccD87c57e38D0098C72AC45',
    ],
  },
  codex: {
    address: '0xCE0e395cF61D0F836ddd4fC021f009C93DFe3a63',
    constructorArgs: [],
  },
  collybus: {
    address: '0x6B576f65DE4B8B171aEF412DEBc33dc53500cFdB',
    constructorArgs: [],
  },
  fiat: {
    address: '0x2d9579552cD679943cbBc23BDdd9467840C98c75',
    constructorArgs: [],
  },
  debtAuction: {
    address: '0x68D8842fE9Ff77942ccD87c57e38D0098C72AC45',
    constructorArgs: [
      '0xCE0e395cF61D0F836ddd4fC021f009C93DFe3a63',
      '0xed1480d12be41d92f36f5f7bdd88212e381a3677',
    ],
  },
  limes: {
    address: '0x965b587965Df57937dAe2A50F8F56aCcd43a4Cf6',
    constructorArgs: ['0xCE0e395cF61D0F836ddd4fC021f009C93DFe3a63'],
  },
  moneta: {
    address: '0xbCC7DaA516aF69F4A8D36fBda8863A125ec05dE8',
    constructorArgs: [
      '0xCE0e395cF61D0F836ddd4fC021f009C93DFe3a63',
      '0x2d9579552cD679943cbBc23BDdd9467840C98c75',
    ],
  },
  collateralAuction: {
    address: '0xa50D5B25E29a8FA7E94DA10698fE5100f0eb0cc5',
    constructorArgs: [
      '0xCE0e395cF61D0F836ddd4fC021f009C93DFe3a63',
      '0x965b587965Df57937dAe2A50F8F56aCcd43a4Cf6',
    ],
  },
  publican: {
    address: '0x3C688e38f95810985608C18A6eeCA3694Af33BE4',
    constructorArgs: ['0xCE0e395cF61D0F836ddd4fC021f009C93DFe3a63'],
  },
  surplusAuction: {
    address: '0x6d1EC06167205ECedc84cF46bF4fb265679FEBc9',
    constructorArgs: [
      '0xCE0e395cF61D0F836ddd4fC021f009C93DFe3a63',
      '0xed1480d12be41d92f36f5f7bdd88212e381a3677',
    ],
  },
  tenebrae: {
    address: '0x967ee7c3893a435b3bDb73dA93FB9cb40Ec3c638',
    constructorArgs: [],
  },
  noLossCollateralAuctionActions: {
    address: '0xF3f2d750a2e1543E376eBd5eE1e7cA0c067fB2ab',
    constructorArgs: [
      '0xCE0e395cF61D0F836ddd4fC021f009C93DFe3a63',
      '0xbCC7DaA516aF69F4A8D36fBda8863A125ec05dE8',
      '0x2d9579552cD679943cbBc23BDdd9467840C98c75',
      '0xa50D5B25E29a8FA7E94DA10698fE5100f0eb0cc5',
    ],
  },
  vaultEPTActions: {
    address: '0xa5FD0632ddC2E6ce5c6a83B81730FBf45D80A8b2',
    constructorArgs: [
      '0xCE0e395cF61D0F836ddd4fC021f009C93DFe3a63',
      '0xbCC7DaA516aF69F4A8D36fBda8863A125ec05dE8',
      '0x2d9579552cD679943cbBc23BDdd9467840C98c75',
      '0x3C688e38f95810985608C18A6eeCA3694Af33BE4',
    ],
  },
  delphiChainlinkFactory: {
    address: '0x3b201C0417B1a9e8847314A94f7045fEB2ccD4cf',
    constructorArgs: [],
  },
  spotRelayer_USDC: {
    address: '0xd1aF2D06Fb6800F607d535cb8E3Eaa9F842f1581',
    constructorArgs: [
      '0x6B576f65DE4B8B171aEF412DEBc33dc53500cFdB',
      1,
      '0xcd946BaDB8E386f9D36B6d6c945DDaCb8D3d5cc8',
      '0x000000000000000000000000a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      25,
    ],
  },
  Oracle_spotRelayer_USDC: {
    address: '0xcd946BaDB8E386f9D36B6d6c945DDaCb8D3d5cc8',
    constructorArgs: [3600, '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6'],
  },
  spotRelayer_DAI: {
    address: '0xb28be97B36469499ca10EF4Ee77a4048EbAA4a11',
    constructorArgs: [
      '0x6B576f65DE4B8B171aEF412DEBc33dc53500cFdB',
      1,
      '0x7c61b54AbaD508c89ABE18a5a56682B9f12A8eE5',
      '0x0000000000000000000000006b175474e89094c44da98b954eedeac495271d0f',
      25,
    ],
  },
  Oracle_spotRelayer_DAI: {
    address: '0x7c61b54AbaD508c89ABE18a5a56682B9f12A8eE5',
    constructorArgs: [3600, '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9'],
  },
  spotRelayer_LUSD: {
    address: '0x9Ef086811982C19A15041DFab328E2868baCEA3b',
    constructorArgs: [
      '0x6B576f65DE4B8B171aEF412DEBc33dc53500cFdB',
      1,
      '0x90612f96F7BCEB4c273Ad5BDeF2C7178396a06C2',
      '0x0000000000000000000000005f98805a4e8be255a32880fdec7f6728c6568ba0',
      25,
    ],
  },
  Oracle_spotRelayer_LUSD: {
    address: '0x90612f96F7BCEB4c273Ad5BDeF2C7178396a06C2',
    constructorArgs: [3600, '0x3D7aE7E594f2f2091Ad8798313450130d0Aba3a0'],
  },
  delphiRelayerFactory: {
    address: '0x1408545b8ce29249300DaE1cD4B675E97CBa4F55',
    constructorArgs: [],
  },
  discountRateRelayer_ePyvUSDC: {
    address: '0x3B5BE84462cb7fFf485B5d0c2e373A8a1C14a4bB',
    constructorArgs: [
      '0x6B576f65DE4B8B171aEF412DEBc33dc53500cFdB',
      0,
      '0x0000000000000000000000000000000000000000000000000000000000000001',
      '3022265993',
    ],
  },
  discountRateRelayer_ePyvDAI: {
    address: '0xb86899e5ac6EAB4B7d82C63EF34c3e49FeD9EF3d',
    constructorArgs: [
      '0x6B576f65DE4B8B171aEF412DEBc33dc53500cFdB',
      0,
      '0x0000000000000000000000000000000000000000000000000000000000000002',
      '3022265993',
    ],
  },
  discountRateRelayer_ePyvLUSD3CRV: {
    address: '0xDBC6a8534a183Db4C92816B86ca6B289d7C30569',
    constructorArgs: [
      '0x6B576f65DE4B8B171aEF412DEBc33dc53500cFdB',
      0,
      '0x0000000000000000000000000000000000000000000000000000000000000003',
      '3022265993',
    ],
  },
  aerGuard: {
    address: '0x90F1e0aE33B9a5036EBAaCDBb2Ce38E5beC4B9F2',
    constructorArgs: [
      '0xa55e0d3d697c4692e9c37bc3a7062b1beceef45b',
      '0x245bD99C7379df6740332d06530DA7Dedb062D61',
      172800,
      '0x60D90FbEC50933f13d0DFeD41cd380ffe357ABf7',
    ],
  },
  auctionGuard: {
    address: '0xFdC77BCE6d90318202F82025fc92C76dE50D45c2',
    constructorArgs: [
      '0xa55e0d3d697c4692e9c37bc3a7062b1beceef45b',
      '0x245bD99C7379df6740332d06530DA7Dedb062D61',
      172800,
      '0xa50D5B25E29a8FA7E94DA10698fE5100f0eb0cc5',
    ],
  },
  codexGuard: {
    address: '0x8d2F851637b680312757f12595E965D5830DBCC4',
    constructorArgs: [
      '0xa55e0d3d697c4692e9c37bc3a7062b1beceef45b',
      '0x245bD99C7379df6740332d06530DA7Dedb062D61',
      172800,
      '0xCE0e395cF61D0F836ddd4fC021f009C93DFe3a63',
    ],
  },
  collybusGuard: {
    address: '0xeF385f2b161173Fc67DdcaB6AD7A8d329c226aAF',
    constructorArgs: [
      '0xa55e0d3d697c4692e9c37bc3a7062b1beceef45b',
      '0x245bD99C7379df6740332d06530DA7Dedb062D61',
      172800,
      '0x6B576f65DE4B8B171aEF412DEBc33dc53500cFdB',
    ],
  },
  limesGuard: {
    address: '0xE170783da136eA4AEA4955986Fd25288D58cC971',
    constructorArgs: [
      '0xa55e0d3d697c4692e9c37bc3a7062b1beceef45b',
      '0x245bD99C7379df6740332d06530DA7Dedb062D61',
      172800,
      '0x965b587965Df57937dAe2A50F8F56aCcd43a4Cf6',
    ],
  },
  publicanGuard: {
    address: '0x018215b52c4EBd2D6dc28099Da746e9F2ccCCb65',
    constructorArgs: [
      '0xa55e0d3d697c4692e9c37bc3a7062b1beceef45b',
      '0x245bD99C7379df6740332d06530DA7Dedb062D61',
      172800,
      '0x3C688e38f95810985608C18A6eeCA3694Af33BE4',
    ],
  },
  vaultGuard: {
    address: '0x0E2c4AF4dc8f7acFBC8C2E5a2c0ab09ED12F70cA',
    constructorArgs: [
      '0xa55e0d3d697c4692e9c37bc3a7062b1beceef45b',
      '0x245bD99C7379df6740332d06530DA7Dedb062D61',
      172800,
      '0xCE0e395cF61D0F836ddd4fC021f009C93DFe3a63',
      '0x3C688e38f95810985608C18A6eeCA3694Af33BE4',
      '0x965b587965Df57937dAe2A50F8F56aCcd43a4Cf6',
      '0x6B576f65DE4B8B171aEF412DEBc33dc53500cFdB',
      '0xa50D5B25E29a8FA7E94DA10698fE5100f0eb0cc5',
      '0x85d85722f8171c75F151872579398821Cf739beb',
    ],
  },
  proxyFactory: {
    address: '0x2E01742855D02aC41e5c954b0Af6be96af1d8975',
    constructorArgs: [],
  },
  proxyRegistry: {
    address: '0x6aD36586D91950Cc232f90c4065faA94427955fB',
    constructorArgs: ['0x2E01742855D02aC41e5c954b0Af6be96af1d8975'],
  },
  vaultFactory: {
    address: '0x4761E6548601566390646988F09b8C9553b8134b',
    constructorArgs: [],
  },
  vaultEPT_ePyvUSDC_Impl: {
    address: '0x1915406c48f7e8CEF0e6ef20EcF3F82469Ae8808',
    constructorArgs: [
      '0xCE0e395cF61D0F836ddd4fC021f009C93DFe3a63',
      '0x62d9855c399fDE8226840eA12D9F1Dd693a49B6A',
      '0x62F161BF3692E4015BefB05A03a94A40f520d1c0',
    ],
  },
  vaultEPT_ePyvUSDC_29APR22: {
    address: '0x23CC2492F079DF1516DB34f257bC1aA98131A085',
    constructorArgs: [
      '0x52C9886d5D87B0f06EbACBEff750B5Ffad5d17d9',
      '0x6B576f65DE4B8B171aEF412DEBc33dc53500cFdB',
    ],
  },
  vaultEPT_ePyvDAI_Impl: {
    address: '0xF6A9A64c4e9ec409060eDbBF8B3df29b9896FB11',
    constructorArgs: [
      '0xCE0e395cF61D0F836ddd4fC021f009C93DFe3a63',
      '0x21BbC083362022aB8D7e42C18c47D484cc95C193',
      '0x62F161BF3692E4015BefB05A03a94A40f520d1c0',
    ],
  },
  vaultEPT_ePyvDAI_29APR22: {
    address: '0xCA1467E6BcfeA869c40d2Ac3aC53fD60c2EC6149',
    constructorArgs: [
      '0x2c72692E94E757679289aC85d3556b2c0f717E0E',
      '0x6B576f65DE4B8B171aEF412DEBc33dc53500cFdB',
    ],
  },
}

type PTokenMap = {
  [vaultAddress: string]: {
    [tokenId: string]: {
      protocol: string
      symbol: string
      decimals: number
      name: string
      icon: string
    }
  }
}

const _NETWORK = 1 // chain Id
const tokenId = '0x0'
const mainnetVaultsMetadata: PTokenMap = {
  '0x23CC2492F079DF1516DB34f257bC1aA98131A085': {
    '0x0': {
      protocol: 'Element Finance',
      symbol: 'USDC Principal Token',
      decimals: 6,
      name: 'eyUSDC:29-APR-22-GMT',
      icon: 'data:image/svg+xml;base64,PHN2ZyBkYXRhLW5hbWU9Ijg2OTc3Njg0LTEyZGItNDg1MC04ZjMwLTIzM2E3YzI2N2QxMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjAwMCAyMDAwIj4KICA8cGF0aCBkPSJNMTAwMCAyMDAwYzU1NC4xNyAwIDEwMDAtNDQ1LjgzIDEwMDAtMTAwMFMxNTU0LjE3IDAgMTAwMCAwIDAgNDQ1LjgzIDAgMTAwMHM0NDUuODMgMTAwMCAxMDAwIDEwMDB6IiBmaWxsPSIjMjc3NWNhIi8+CiAgPHBhdGggZD0iTTEyNzUgMTE1OC4zM2MwLTE0NS44My04Ny41LTE5NS44My0yNjIuNS0yMTYuNjYtMTI1LTE2LjY3LTE1MC01MC0xNTAtMTA4LjM0czQxLjY3LTk1LjgzIDEyNS05NS44M2M3NSAwIDExNi42NyAyNSAxMzcuNSA4Ny41IDQuMTcgMTIuNSAxNi42NyAyMC44MyAyOS4xNyAyMC44M2g2Ni42NmMxNi42NyAwIDI5LjE3LTEyLjUgMjkuMTctMjkuMTZ2LTQuMTdjLTE2LjY3LTkxLjY3LTkxLjY3LTE2Mi41LTE4Ny41LTE3MC44M3YtMTAwYzAtMTYuNjctMTIuNS0yOS4xNy0zMy4zMy0zMy4zNGgtNjIuNWMtMTYuNjcgMC0yOS4xNyAxMi41LTMzLjM0IDMzLjM0djk1LjgzYy0xMjUgMTYuNjctMjA0LjE2IDEwMC0yMDQuMTYgMjA0LjE3IDAgMTM3LjUgODMuMzMgMTkxLjY2IDI1OC4zMyAyMTIuNSAxMTYuNjcgMjAuODMgMTU0LjE3IDQ1LjgzIDE1NC4xNyAxMTIuNXMtNTguMzQgMTEyLjUtMTM3LjUgMTEyLjVjLTEwOC4zNCAwLTE0NS44NC00NS44NC0xNTguMzQtMTA4LjM0LTQuMTYtMTYuNjYtMTYuNjYtMjUtMjkuMTYtMjVoLTcwLjg0Yy0xNi42NiAwLTI5LjE2IDEyLjUtMjkuMTYgMjkuMTd2NC4xN2MxNi42NiAxMDQuMTYgODMuMzMgMTc5LjE2IDIyMC44MyAyMDB2MTAwYzAgMTYuNjYgMTIuNSAyOS4xNiAzMy4zMyAzMy4zM2g2Mi41YzE2LjY3IDAgMjkuMTctMTIuNSAzMy4zNC0zMy4zM3YtMTAwYzEyNS0yMC44NCAyMDguMzMtMTA4LjM0IDIwOC4zMy0yMjAuODR6IiBmaWxsPSIjZmZmIi8+CiAgPHBhdGggZD0iTTc4Ny41IDE1OTUuODNjLTMyNS0xMTYuNjYtNDkxLjY3LTQ3OS4xNi0zNzAuODMtODAwIDYyLjUtMTc1IDIwMC0zMDguMzMgMzcwLjgzLTM3MC44MyAxNi42Ny04LjMzIDI1LTIwLjgzIDI1LTQxLjY3VjMyNWMwLTE2LjY3LTguMzMtMjkuMTctMjUtMzMuMzMtNC4xNyAwLTEyLjUgMC0xNi42NyA0LjE2LTM5NS44MyAxMjUtNjEyLjUgNTQ1Ljg0LTQ4Ny41IDk0MS42NyA3NSAyMzMuMzMgMjU0LjE3IDQxMi41IDQ4Ny41IDQ4Ny41IDE2LjY3IDguMzMgMzMuMzQgMCAzNy41LTE2LjY3IDQuMTctNC4xNiA0LjE3LTguMzMgNC4xNy0xNi42NnYtNTguMzRjMC0xMi41LTEyLjUtMjkuMTYtMjUtMzcuNXpNMTIyOS4xNyAyOTUuODNjLTE2LjY3LTguMzMtMzMuMzQgMC0zNy41IDE2LjY3LTQuMTcgNC4xNy00LjE3IDguMzMtNC4xNyAxNi42N3Y1OC4zM2MwIDE2LjY3IDEyLjUgMzMuMzMgMjUgNDEuNjcgMzI1IDExNi42NiA0OTEuNjcgNDc5LjE2IDM3MC44MyA4MDAtNjIuNSAxNzUtMjAwIDMwOC4zMy0zNzAuODMgMzcwLjgzLTE2LjY3IDguMzMtMjUgMjAuODMtMjUgNDEuNjdWMTcwMGMwIDE2LjY3IDguMzMgMjkuMTcgMjUgMzMuMzMgNC4xNyAwIDEyLjUgMCAxNi42Ny00LjE2IDM5NS44My0xMjUgNjEyLjUtNTQ1Ljg0IDQ4Ny41LTk0MS42Ny03NS0yMzcuNS0yNTguMzQtNDE2LjY3LTQ4Ny41LTQ5MS42N3oiIGZpbGw9IiNmZmYiLz4KPC9zdmc+Cg==',
    },
  },
  '0xCA1467E6BcfeA869c40d2Ac3aC53fD60c2EC6149': {
    '0x0': {
      protocol: 'Element Finance',
      symbol: 'DAI Principal Token',
      decimals: 6,
      name: 'eyDAI:29-APR-22-GMT',
      icon: 'data:image/svg+xml;base64,PHN2ZyBkYXRhLW5hbWU9Ijg2OTc3Njg0LTEyZGItNDg1MC04ZjMwLTIzM2E3YzI2N2QxMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB2aWV3Qm94PSIwIDAgMjAwMCAyMDAwIj4KICA8cGF0aCBkPSJNMTAwMCAyMDAwYzU1NC4xNyAwIDEwMDAtNDQ1LjgzIDEwMDAtMTAwMFMxNTU0LjE3IDAgMTAwMCAwIDAgNDQ1LjgzIDAgMTAwMHM0NDUuODMgMTAwMCAxMDAwIDEwMDB6IiBmaWxsPSIjMjc3NWNhIi8+CiAgPHBhdGggZD0iTTEyNzUgMTE1OC4zM2MwLTE0NS44My04Ny41LTE5NS44My0yNjIuNS0yMTYuNjYtMTI1LTE2LjY3LTE1MC01MC0xNTAtMTA4LjM0czQxLjY3LTk1LjgzIDEyNS05NS44M2M3NSAwIDExNi42NyAyNSAxMzcuNSA4Ny41IDQuMTcgMTIuNSAxNi42NyAyMC44MyAyOS4xNyAyMC44M2g2Ni42NmMxNi42NyAwIDI5LjE3LTEyLjUgMjkuMTctMjkuMTZ2LTQuMTdjLTE2LjY3LTkxLjY3LTkxLjY3LTE2Mi41LTE4Ny41LTE3MC44M3YtMTAwYzAtMTYuNjctMTIuNS0yOS4xNy0zMy4zMy0zMy4zNGgtNjIuNWMtMTYuNjcgMC0yOS4xNyAxMi41LTMzLjM0IDMzLjM0djk1LjgzYy0xMjUgMTYuNjctMjA0LjE2IDEwMC0yMDQuMTYgMjA0LjE3IDAgMTM3LjUgODMuMzMgMTkxLjY2IDI1OC4zMyAyMTIuNSAxMTYuNjcgMjAuODMgMTU0LjE3IDQ1LjgzIDE1NC4xNyAxMTIuNXMtNTguMzQgMTEyLjUtMTM3LjUgMTEyLjVjLTEwOC4zNCAwLTE0NS44NC00NS44NC0xNTguMzQtMTA4LjM0LTQuMTYtMTYuNjYtMTYuNjYtMjUtMjkuMTYtMjVoLTcwLjg0Yy0xNi42NiAwLTI5LjE2IDEyLjUtMjkuMTYgMjkuMTd2NC4xN2MxNi42NiAxMDQuMTYgODMuMzMgMTc5LjE2IDIyMC44MyAyMDB2MTAwYzAgMTYuNjYgMTIuNSAyOS4xNiAzMy4zMyAzMy4zM2g2Mi41YzE2LjY3IDAgMjkuMTctMTIuNSAzMy4zNC0zMy4zM3YtMTAwYzEyNS0yMC44NCAyMDguMzMtMTA4LjM0IDIwOC4zMy0yMjAuODR6IiBmaWxsPSIjZmZmIi8+CiAgPHBhdGggZD0iTTc4Ny41IDE1OTUuODNjLTMyNS0xMTYuNjYtNDkxLjY3LTQ3OS4xNi0zNzAuODMtODAwIDYyLjUtMTc1IDIwMC0zMDguMzMgMzcwLjgzLTM3MC44MyAxNi42Ny04LjMzIDI1LTIwLjgzIDI1LTQxLjY3VjMyNWMwLTE2LjY3LTguMzMtMjkuMTctMjUtMzMuMzMtNC4xNyAwLTEyLjUgMC0xNi42NyA0LjE2LTM5NS44MyAxMjUtNjEyLjUgNTQ1Ljg0LTQ4Ny41IDk0MS42NyA3NSAyMzMuMzMgMjU0LjE3IDQxMi41IDQ4Ny41IDQ4Ny41IDE2LjY3IDguMzMgMzMuMzQgMCAzNy41LTE2LjY3IDQuMTctNC4xNiA0LjE3LTguMzMgNC4xNy0xNi42NnYtNTguMzRjMC0xMi41LTEyLjUtMjkuMTYtMjUtMzcuNXpNMTIyOS4xNyAyOTUuODNjLTE2LjY3LTguMzMtMzMuMzQgMC0zNy41IDE2LjY3LTQuMTcgNC4xNy00LjE3IDguMzMtNC4xNyAxNi42N3Y1OC4zM2MwIDE2LjY3IDEyLjUgMzMuMzMgMjUgNDEuNjcgMzI1IDExNi42NiA0OTEuNjcgNDc5LjE2IDM3MC44MyA4MDAtNjIuNSAxNzUtMjAwIDMwOC4zMy0zNzAuODMgMzcwLjgzLTE2LjY3IDguMzMtMjUgMjAuODMtMjUgNDEuNjdWMTcwMGMwIDE2LjY3IDguMzMgMjkuMTcgMjUgMzMuMzMgNC4xNyAwIDEyLjUgMCAxNi42Ny00LjE2IDM5NS44My0xMjUgNjEyLjUtNTQ1Ljg0IDQ4Ny41LTk0MS42Ny03NS0yMzcuNS0yNTguMzQtNDE2LjY3LTQ4Ny41LTQ5MS42N3oiIGZpbGw9IiNmZmYiLz4KPC9zdmc+Cg==',
    },
  },
}

// const pTokens = {
//   '0xdcf80c068b7ffdf7273d8adae4b076bf384f711a': {
//     chainId: 5,
//     chainName: 'Goerli',
//     protocol: 'Element Finance',
//     symbol: 'USDC Principal Token',
//     decimals: 6,
//     icon: '', // SVG
//     name: 'eyUSDC:10-AUG-22-GMT',
//   },
// }

const lowerCasedAddresses = Object.fromEntries(
  Object.entries(mainnetVaultsMetadata).map(([k, v]) => [k.toLowerCase(), v]),
)

const pTokensProxy = new Proxy<PTokenMap>(
  { ...lowerCasedAddresses },
  {
    get(target, prop) {
      if (typeof prop === 'string') {
        return target[prop.toLowerCase()]
      }
    },
  },
)

export function getTokenByAddress({
  address,
  tokenId,
}: {
  address?: Maybe<string>
  tokenId?: Maybe<string>
}) {
  if (!address || !tokenId) {
    return
  }

  return pTokensProxy[address]
}

export const getCollateralMetadata = ({
  tokenId,
  vaultAddress,
}: {
  vaultAddress?: Maybe<string>
  tokenId?: Maybe<string>
}) => {
  if (!vaultAddress || !tokenId) {
    return
  }

  return pTokensProxy[vaultAddress][tokenId]
}

const vaultAddress = '0x23CC2492F079DF1516DB34f257bC1aA98131A085'
const tokenId = '0x0'
const metadata = mainnetVaultsMetadata[vaultAddress][tokenId]
const altra_metadata = getCollateralMetadata({ vaultAddress, tokenId })
