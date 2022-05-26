import { contracts } from '@/src/constants/contracts'

// TODO Move
export type AppContracts = keyof typeof contracts

export const PROTOCOLS = ['Element', 'Notional', 'BarnBridge'] as const
export type Protocol = typeof PROTOCOLS[number]

export const protocolNamesByKeyword: { [key: string]: Protocol } = {
  ept: 'Element',
  fc: 'Notional',
  sy: 'BarnBridge',
}
