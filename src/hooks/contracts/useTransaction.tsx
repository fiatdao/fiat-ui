import { notification } from 'antd'
import { useCallback } from 'react'

import { Contract, ContractTransaction } from '@ethersproject/contracts'

import { AppContractInfo } from '@/src/constants/contracts'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { TransactionError } from '@/src/utils/TransactionError'

export type QueryOptions = {
  refetchInterval: number
}

export default function useTransaction<
  MyContract extends Contract,
  Method extends keyof MyContract,
  Params extends Parameters<MyContract[Method]>,
>(contractInfo: AppContractInfo, method: Method) {
  const { appChainId, getExplorerUrl, isAppConnected, web3Provider } = useWeb3Connection()

  return useCallback(
    async (...params: Params) => {
      const signer = web3Provider?.getSigner()
      if (!signer) {
        notification.destroy()
        notification.error({
          description: 'Transaction failed, there is no provider',
          message: 'Transaction error',
        })
        return null
      }

      if (!isAppConnected) {
        notification.destroy()
        notification.error({
          description: 'App is not connected',
          message: 'Error',
        })
        return null
      }

      const contract = new Contract(
        contractInfo.address[appChainId],
        contractInfo.abi,
        signer,
      ) as MyContract

      let tx: ContractTransaction
      try {
        notification.destroy()
        notification.info({
          description: 'Please sign the transaction.',
          message: 'Sign',
        })
        tx = await contract[method](...params)
        notification.destroy()
        notification.info({
          description: (
            <a
              href={getExplorerUrl(tx.hash)}
              referrerPolicy="no-referrer"
              rel="noreferrer"
              target="_blank"
            >
              view on explorer
            </a>
          ),
          message: 'Awaiting tx execution',
          duration: 0,
        })
      } catch (e: any) {
        const error = new TransactionError(
          e.data?.message || e.message || 'Unable to decode revert reason',
          e.data?.code || e.code,
          e.data,
        )
        if (error.code === 4001) {
          notification.destroy()
          notification.warning({
            description: 'User denied signature',
            message: 'Transaction rejected',
          })
          return null
        }

        notification.destroy()
        notification.error({
          description: error.message,
          message: 'Transaction error',
        })
        return null
      }

      try {
        const receipt = await tx.wait()
        notification.destroy()
        notification.success({
          description: (
            <a
              href={getExplorerUrl(tx.hash)}
              referrerPolicy="no-referrer"
              rel="noreferrer"
              target="_blank"
            >
              view on explorer
            </a>
          ),
          message: 'Transaction success',
        })
        return receipt
      } catch (e: any) {
        const error = new TransactionError(
          e.data?.message || e.message || 'Unable to decode revert reason',
          e.data?.code || e.code,
          e.data,
        )
        notification.destroy()
        notification.error({
          description: error.message,
          message: 'Transaction error',
        })
        return null
      }
    },
    [
      web3Provider,
      isAppConnected,
      contractInfo.address,
      contractInfo.abi,
      appChainId,
      method,
      getExplorerUrl,
    ],
  )
}
