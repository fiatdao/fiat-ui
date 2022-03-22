import { useCallback } from 'react'
import { Contract, ContractTransaction } from '@ethersproject/contracts'
import { useNotifications } from '@/src/hooks/useNotifications'
import { AppContractInfo } from '@/src/constants/contracts'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

export type QueryOptions = {
  refetchInterval: number
}

export default function useTransaction<
  MyContract extends Contract,
  Method extends keyof MyContract,
  Params extends Parameters<MyContract[Method]>,
>(contractInfo: AppContractInfo, method: Method) {
  const { appChainId, isAppConnected, web3Provider } = useWeb3Connection()
  const notification = useNotifications()

  return useCallback(
    async (...params: Params) => {
      const signer = web3Provider?.getSigner()
      if (!signer) {
        notification.noSigner()
        return null
      }

      if (!isAppConnected) {
        notification.appNotConnected()
        return null
      }

      const contract = new Contract(
        contractInfo.address[appChainId],
        contractInfo.abi,
        signer,
      ) as MyContract

      let tx: ContractTransaction

      try {
        notification.requestSign()
        tx = await contract[method](...params)
        notification.awaitingTx(tx.hash)
      } catch (e: any) {
        notification.handleTxError(e)
        return null
      }

      try {
        const receipt = await tx.wait()
        notification.successfulTx(tx.hash)
        return receipt
      } catch (e: any) {
        notification.handleTxError(e)
        return null
      }
    },
    [
      web3Provider,
      isAppConnected,
      contractInfo.address,
      contractInfo.abi,
      appChainId,
      notification,
      method,
    ],
  )
}
