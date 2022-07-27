import { getHumanValue } from '../web3/utils'
import BigNumber from 'bignumber.js'

// BigNumber config
BigNumber.config({ POW_PRECISION: 80 })

export const ZERO_BIG_NUMBER = new BigNumber(0)
export const ONE_BIG_NUMBER = new BigNumber(1)
export const TWO_BIG_NUMBER = new BigNumber(2)
export const INFINITE_HEALTH_FACTOR_NUMBER = new BigNumber(100)
export const MAX_UINT_256 = TWO_BIG_NUMBER.pow(256).minus(1)

// time constants
export const ONE_MINUTE_IN_SECONDS = 60
export const ONE_HOUR_IN_SECONDS = 60 * ONE_MINUTE_IN_SECONDS
export const ONE_DAY_IN_SECONDS = 24 * ONE_HOUR_IN_SECONDS
export const ONE_YEAR_IN_SECONDS = 365 * ONE_DAY_IN_SECONDS

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const DEFAULT_CHAIN_ID = process.env.NEXT_PUBLIC_REACT_APP_DEFAULT_CHAIN_ID || 5
export const SUBGRAPH_GOERLI = process.env.NEXT_PUBLIC_REACT_APP_SUBGRAPH_GOERLI || ''
export const SUBGRAPH_MAINNET = process.env.NEXT_PUBLIC_REACT_APP_SUBGRAPH_MAINNET || ''
export const SUBGRAPH_FORKING = 'http://localhost:8000/subgraphs/name/fiatdao/fiat-subgraph'

export const RPC_URL_GOERLI = process.env.NEXT_PUBLIC_REACT_APP_RPC_URL_GOERLI || ''
export const RPC_URL_MAINNET = process.env.NEXT_PUBLIC_REACT_APP_RPC_URL_MAINNET || ''
export const RPC_URL_LOCALHOST = 'http://localhost:8545'

export const WAD_DECIMALS = 18

export const WAIT_BLOCKS = 8
// @TODO virtualRateSafetyMargin is a constant in the UI (a margin of 1.000002 reflects the increase in virtualRate for an interest rate of 2% p.a. over 1 hr)
export const VIRTUAL_RATE_MAX_SLIPPAGE = new BigNumber(1.000002)

export const INFINITE_BIG_NUMBER = new BigNumber(Number.POSITIVE_INFINITY)
export const SECONDS_IN_A_YEAR = 31536000
export const FIAT_TICKER = 'FIAT'

// @TODO: var used to calculate difference between big numbers in non human format
export const MIN_EPSILON_OFFSET = new BigNumber(0.005)

export const SET_FIAT_ALLOWANCE_PROXY_TEXT = 'Set Allowance for FIAT'
export const ENABLE_PROXY_FOR_FIAT_TEXT = 'Enable Proxy for FIAT'
export const EXECUTE_TEXT = 'Execute'
export const DEPOSIT_COLLATERAL_TEXT = 'Deposit collateral'
export const DEPOSIT_UNDERLYING_TEXT = 'Deposit underlying'
export const INSUFFICIENT_BALANCE_TEXT = 'Insufficient balance'
export const EST_FIAT_TOOLTIP_TEXT = `Due to the vault's global
  interest accumulator, the FIAT you receive (send) when borrowing
  (repaying) may be slightly different than what is displayed.`
export const EST_HEALTH_FACTOR_TOOLTIP_TEXT = `Due to the vault's global
interest accumulator, your new health factor may end up slightly different 
  than what is displayed.`

export function getBorrowAmountBelowDebtFloorText(debtFloor: BigNumber | undefined): string {
  const belowMinimumAmountText = 'Below minimum borrow amount'
  if (!debtFloor) {
    return belowMinimumAmountText
  }

  const humanReadableDebtFloor = getHumanValue(debtFloor, WAD_DECIMALS).toFixed(2)
  return `${belowMinimumAmountText} (${humanReadableDebtFloor} FIAT)`
}
