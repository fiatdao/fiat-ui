import { BigNumber } from '@ethersproject/bignumber'

export const ZERO_BN = BigNumber.from(0)
export const MAX_BN = BigNumber.from(2).pow(256).sub(1)

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export const BLOCKS_PER_MINUTE = 4.45

export const API_URL = process.env.NEXT_PUBLIC_REACT_APP_API_URL

export const SIGN_IN_MESSAGE =
  'Welcome to FIAT!\nClick "Sign" to sign in. No password needed!\nThis request will not trigger a blockchain transaction or cost any gas fees.\nI accept the FIAT DAO Terms of Service: ...'
export const SIGN_IN_STORAGE_KEY = 'fiat_signin'
