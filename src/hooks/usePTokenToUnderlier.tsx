import { contracts } from '@/src/constants/contracts'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { KeyedMutator } from 'swr'
import BigNumber from 'bignumber.js'
import { BytesLike } from '@ethersproject/bytes'

type PTokenToUnderlier = {
  vault: string
  balancerVault: string
  curvePoolId: BytesLike
  pTokenAmount: BigNumber
}

export const usePTokenToUnderlier = (params: PTokenToUnderlier): [BigNumber, KeyedMutator<any>] => {
  const { appChainId } = useWeb3Connection()

  const [pTokenToUnderlier, refetchPTokenToUnderlier] = useContractCall(
    contracts.USER_ACTIONS_EPT.address[appChainId],
    contracts.USER_ACTIONS_EPT.abi,
    'pTokenToUnderlier',
    [params.vault, params.balancerVault, params.curvePoolId, params.pTokenAmount.toFixed(0, 8)],
  ) ?? ['ZERO_BIG_NUMBER', null]

  return [pTokenToUnderlier, refetchPTokenToUnderlier]
}
