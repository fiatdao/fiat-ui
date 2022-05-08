import { ERC1155 } from '../../types/typechain'
import { Contract } from 'ethers'
import { useCallback, useMemo, useState } from 'react'
import { isAddress } from 'ethers/lib/utils'
import { TransactionError } from '@/src/utils/TransactionError'
import { useNotifications } from '@/src/hooks/useNotifications'
import { useWeb3Connected } from '@/src/providers/web3ConnectionProvider'
import { contracts } from '@/src/constants/contracts'

export const useERC155Allowance = (tokenAddress: string, spender: string) => {
  const { isAppConnected, web3Provider } = useWeb3Connected()
  const [loadingApprove, setLoadingApprove] = useState(false)
  const notification = useNotifications()

  const erc1155 = useMemo(
    () =>
      isAddress(tokenAddress) && web3Provider
        ? (new Contract(tokenAddress, contracts.ERC_1155.abi, web3Provider?.getSigner()) as ERC1155)
        : null,
    [tokenAddress, web3Provider],
  )

  const approve = useCallback(async () => {
    if (!isAppConnected) {
      notification.appNotConnected()
    }

    if (erc1155 && isAddress(spender)) {
      try {
        setLoadingApprove(true)

        // approve spender
        notification.requestSign()

        const tx = await erc1155.setApprovalForAll(spender, true).catch(notification.handleTxError)

        if (tx instanceof TransactionError) {
          throw tx
        }

        notification.awaitingTx(tx.hash)

        const receipt = await tx.wait().catch(notification.handleTxError)

        if (receipt instanceof TransactionError) {
          throw receipt
        }

        notification.successfulGenericTx(receipt.transactionHash)
      } catch (e) {
        console.error('Failed to set approval', e)
      } finally {
        setLoadingApprove(false)
      }
    }
  }, [erc1155, isAppConnected, notification, spender])

  return {
    erc1155,
    approve,
    loadingApprove,
    hasAllowance: true,
  }
}
