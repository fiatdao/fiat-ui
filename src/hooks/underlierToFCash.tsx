import { contracts } from '@/src/constants/contracts'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { KeyedMutator } from 'swr'
import BigNumber from 'bignumber.js'

type UnderlierToPToken = {
  tokenId: string
  amount: BigNumber
}

export const useUnderlierToFCash = (params: UnderlierToPToken): [BigNumber, KeyedMutator<any>] => {
  const { appChainId } = useWeb3Connection()

  const [underlierToFCash, refetchUnderlierToFCash] = useContractCall(
    contracts.USER_ACTIONS_FC.address[appChainId],
    contracts.USER_ACTIONS_FC.abi,
    'underlierToFCash',
    [params.tokenId, params.amount.toFixed(0, 8)],
  ) ?? ['ZERO_BIG_NUMBER', null]

  return [underlierToFCash, refetchUnderlierToFCash]
}
