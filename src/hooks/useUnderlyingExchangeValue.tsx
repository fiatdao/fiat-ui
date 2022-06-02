import BigNumber from 'bignumber.js'
import { KeyedMutator } from 'swr'
import { contracts } from '@/src/constants/contracts'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { BytesLike } from "@ethersproject/bytes";

type UnderlierToPToken = {
  vault: string,
  balancerVault: string,
  curvePoolId: BytesLike,
  underlierAmount: BigNumber,
}

export const useUnderlyingExchangeValue = (params: UnderlierToPToken): [BigNumber, KeyedMutator<any>] => {
  const { appChainId } = useWeb3Connection()

  const [underlierToPToken, refetchUnderlierToPToken] = useContractCall(
    contracts.USER_ACTIONS_EPT.address[appChainId],
    contracts.USER_ACTIONS_EPT.abi,
    'underlierToPToken',
    [
      params.vault,
      params.balancerVault,
      params.curvePoolId,
      params.underlierAmount.toFixed(0,8)
    ],
  ) ?? ['ZERO_BIG_NUMBER', null]

  return [underlierToPToken, refetchUnderlierToPToken]
}
