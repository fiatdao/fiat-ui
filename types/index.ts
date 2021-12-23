import { contracts } from '@/src/constants/contracts'

export type AppContracts = keyof typeof contracts

type Collateral =
  | 'usdc'
  | 'weth'
  | 'dai'
  | 'lusd3crv-f'
  | 'crvtricrypto'
  | 'stecrv'
  | 'crv3crypto'
  | 'wbtc'
  | 'alusd3crv-f'
  | 'mim-3lp3crv-f'
  | 'eurscrv'

type Deposits = 'yearn' | 'yearnv4'
export const PROTOCOLS = ['BarnBridge', 'Notional', 'Element'] as const
export type Protocol = typeof PROTOCOLS[number]

export type TrancheData = {
  expiration: number
  address: string
  trancheFactory: string
  ptPool: {
    address: string
    poolId: string
    fee: string
    timeStretch: number
  }
  ytPool: {
    address: string
    poolId: string
    fee: string
  }
  weightedPoolFactory: string
}

export type ElementJSON = {
  tokens: Record<Collateral, string>
  wrappedPositions: Record<Deposits, Record<Collateral, string>>
  vaults: Record<Deposits, Record<Collateral, string>>
  trancheFactory: string
  userProxy: string
  balancerVault: string
  weightedPoolFactory: string
  convergentCurvePoolFactory: string
  tranches: Record<Collateral, TrancheData[]>
}
