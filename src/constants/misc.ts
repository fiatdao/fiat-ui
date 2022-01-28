import { BigNumber } from '@ethersproject/bignumber'

export const ZERO_BN = BigNumber.from(0)
export const MAX_BN = BigNumber.from(2).pow(256).sub(1)

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const BLOCKS_PER_MINUTE = 4.45

export const API_URL = process.env.NEXT_PUBLIC_REACT_APP_API_URL
export const SUBGRAPH_API = process.env.NEXT_PUBLIC_REACT_APP_SUBGRAPH_API || ''
