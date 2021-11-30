import { ChainsValues } from '../constants/chains'
import findKey from 'lodash/findKey'
import { contracts } from '@/src/constants/contracts'

export default function getContractNameFromAddress(chainId: ChainsValues, address: string): string {
  const tokenKey = findKey(contracts, { address: { [chainId]: address.toLowerCase() } })

  if (!tokenKey) {
    throw Error(`There is no contract for adddress ${address}`)
  }

  return tokenKey
}
