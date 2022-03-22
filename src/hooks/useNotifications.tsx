import { notification as antdNotification } from 'antd'
import { useCallback } from 'react'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { TransactionError } from '@/src/utils/TransactionError'

export const useNotifications = () => {
  const { getExplorerUrl } = useWeb3Connection()
  antdNotification.config({
    maxCount: 1,
    duration: 0,
    placement: 'topLeft',
  })

  const handleTxError = useCallback((e: any) => {
    const error = new TransactionError(
      e.data?.message || e.message || 'Unable to decode revert reason',
      e.data?.code || e.code,
      e.data,
    )

    // user rejected
    if (error.code === 4001) {
      antdNotification.warning({
        description: 'User denied signature',
        message: 'Transaction rejected',
      })
    }

    // error on transaction
    antdNotification.error({
      description: error.message,
      message: 'Transaction error',
    })

    return error
  }, [])

  const awaitingTx = useCallback(
    (txHash: string) => {
      antdNotification.info({
        description: (
          <a
            href={getExplorerUrl(txHash)}
            referrerPolicy="no-referrer"
            rel="noreferrer"
            target="_blank"
          >
            view on explorer
          </a>
        ),
        message: 'Awaiting tx execution',
      })
    },
    [getExplorerUrl],
  )

  const successfulTx = useCallback(
    (txHash: string) => {
      antdNotification.success({
        description: (
          <a
            href={getExplorerUrl(txHash)}
            referrerPolicy="no-referrer"
            rel="noreferrer"
            target="_blank"
          >
            view on explorer
          </a>
        ),
        message: 'Transaction success',
      })
    },
    [getExplorerUrl],
  )

  const requestSign = () => {
    antdNotification.info({
      description: 'Please sign the transaction.',
      message: 'Sign',
    })
  }

  const noSigner = () => {
    antdNotification.error({
      description: 'Transaction failed, account not connected',
      message: 'Transaction error',
    })
  }

  const appNotConnected = () => {
    antdNotification.error({
      description: 'App is not connected',
      message: 'Error',
    })
  }

  return {
    ...antdNotification,
    handleTxError,
    awaitingTx,
    successfulTx,
    requestSign,
    noSigner,
    appNotConnected,
  }
}
