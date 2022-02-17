import BigNumber from 'bignumber.js'

export const ZERO_BIG_NUMBER = BigNumber.from(0)
export const MAX_UINT_256 = BigNumber.from(2).pow(256).minus(1)
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const SUBGRAPH_API = process.env.NEXT_PUBLIC_REACT_APP_SUBGRAPH_API || ''
export const WAD_DECIMALS = 18
