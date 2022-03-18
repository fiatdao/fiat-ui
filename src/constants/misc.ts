import BigNumber from 'bignumber.js'

export const ZERO_BIG_NUMBER = new BigNumber(0)
export const ONE_BIG_NUMBER = new BigNumber(1)
export const TWO_BIG_NUMBER = new BigNumber(2)
export const INFINITE_HEALTH_FACTOR_NUMBER = new BigNumber(10000000000000000000)
export const MAX_UINT_256 = TWO_BIG_NUMBER.pow(256).minus(1)
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const SUBGRAPH_API = process.env.NEXT_PUBLIC_REACT_APP_SUBGRAPH_API || ''
export const WAD_DECIMALS = 18

export const WAIT_BLOCKS = 8
// @TODO use virtualRate method from publican contract
export const VIRTUAL_RATE = new BigNumber(1.01)

export const INFINITE_BIG_NUMBER = new BigNumber(Number.POSITIVE_INFINITY)
