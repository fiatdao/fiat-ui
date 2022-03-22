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

  const handleTxError = useCallback(
    (e: any) => {
      const error = new TransactionError(
        e.data?.message || e.message || 'Unable to decode revert reason',
        e.data?.code || e.code,
        e.data,
      )

      // failed to execute tx
      // exception triggered by ethers-js
      if (e.code === 'CALL_EXCEPTION') {
        antdNotification.error({
          message: 'Transaction error',
          description: (
            <a
              href={getExplorerUrl(e.transactionHash)}
              referrerPolicy="no-referrer"
              rel="noreferrer"
              target="_blank"
            >
              view on explorer
            </a>
          ),
        })

        return error
      }

      // user rejected
      if (error.code === 4001) {
        antdNotification.warning({
          message: 'Transaction rejected',
          description: 'User denied signature',
        })

        return error
      }

      antdNotification.error({
        message: 'Transaction creation failed',
        description: error.message.substring(0, 200),
      })

      return error
    },
    [getExplorerUrl],
  )

  const awaitingTx = useCallback(
    (txHash: string) => {
      antdNotification.info({
        message: 'Awaiting tx execution',
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
      })
    },
    [getExplorerUrl],
  )

  const awaitingTxBlocks = useCallback(
    (txHash: string, blocks: number) => {
      antdNotification.info({
        message: `Awaiting tx execution`,
        description: (
          <>
            <p>Waiting {blocks} blocks confirmation.</p>
            <a
              href={getExplorerUrl(txHash)}
              referrerPolicy="no-referrer"
              rel="noreferrer"
              target="_blank"
            >
              View on explorer
            </a>
          </>
        ),
      })
    },
    [getExplorerUrl],
  )

  const successfulTx = useCallback(
    (txHash: string) => {
      antdNotification.success({
        message: 'Transaction successful',
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
      })
    },
    [getExplorerUrl],
  )

  const requestSign = () => {
    antdNotification.info({
      message: 'Sign',
      description: 'Please sign the transaction.',
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
    awaitingTxBlocks,
    successfulTx,
    requestSign,
    noSigner,
    appNotConnected,
  }
}
