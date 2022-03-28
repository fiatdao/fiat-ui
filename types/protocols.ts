import { contracts } from '@/src/constants/contracts'

// TODO Move
export type AppContracts = keyof typeof contracts

export const PROTOCOLS = ['Element', 'Notional'] as const
export type Protocol = typeof PROTOCOLS[number]

// TODO Add typeguard to check protocol
