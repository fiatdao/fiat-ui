import { contracts } from '@/src/constants/contracts'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { KeyedMutator } from 'swr'
import BigNumber from 'bignumber.js'

type UnderlierToFYToken = {
  yieldSpacePool: string
  underlierAmount: BigNumber
}

export const useUnderlierToFYToken = (
  params: UnderlierToFYToken,
): [BigNumber, KeyedMutator<any>] => {
  const { appChainId } = useWeb3Connection()

  const [underlierToFYToken, refetchUnderlierToFYToken] = useContractCall(
    contracts.USER_ACTIONS_FY.address[appChainId],
    contracts.USER_ACTIONS_FY.abi,
    'underlierToFYToken',
    [params.underlierAmount.toFixed(0, 8), params.yieldSpacePool],
  ) ?? ['ZERO_BIG_NUMBER', null]

  return [underlierToFYToken, refetchUnderlierToFYToken]
}
