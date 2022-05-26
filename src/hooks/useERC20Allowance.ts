import BigNumber from 'bignumber.js'
import { isAddress } from 'ethers/lib/utils'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Contract, ethers } from 'ethers'
import { TransactionError } from '@/src/utils/TransactionError'
import { useNotifications } from '@/src/hooks/useNotifications'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { useWeb3Connected } from '@/src/providers/web3ConnectionProvider'
import { contracts } from '@/src/constants/contracts'
import { ERC20 } from '@/types/typechain'

/**
 * Only handles the allowance of a tokenAddress for the EOA/connected account to a specified spender
 */
export const useERC20Allowance = (tokenAddress: string, spender: string) => {
  const { address: currentUserAddress, isAppConnected, web3Provider } = useWeb3Connected()
  const [allowance, setAllowance] = useState(ZERO_BIG_NUMBER)
  const [loadingApprove, setLoadingApprove] = useState(false)
  const notification = useNotifications()

  const erc20 = useMemo(
    () =>
      isAddress(tokenAddress) && web3Provider
        ? (new Contract(tokenAddress, contracts.ERC_20.abi, web3Provider?.getSigner()) as ERC20)
        : null,
    [tokenAddress, web3Provider],
  )

  const approve = useCallback(async () => {
    if (!isAppConnected) {
      notification.appNotConnected()
    }

    if (erc20 && isAddress(spender)) {
      try {
        setLoadingApprove(true)

        // approve spender
        notification.requestSign()

        const tx = await erc20
          .approve(spender, ethers.constants.MaxUint256)
          .catch(notification.handleTxError)

        if (tx instanceof TransactionError) {
          throw tx
        }

        notification.awaitingTx(tx.hash)

        const receipt = await tx.wait().catch(notification.handleTxError)

        if (receipt instanceof TransactionError) {
          throw receipt
        }

        notification.successfulGenericTx(receipt.transactionHash)

        // retrieve allowance
        const allowance = (await erc20.allowance(currentUserAddress, spender)).toString()
        setAllowance(BigNumber.from(allowance) as BigNumber)
      } catch (e) {
        console.error('Failed to set allowance', e)
      } finally {
        setLoadingApprove(false)
      }
    }
  }, [currentUserAddress, erc20, isAppConnected, notification, spender])

  useEffect(() => {
    if (erc20 && isAddress(spender) && currentUserAddress) {
      erc20
        .allowance(currentUserAddress, spender)
        .then((allowance) => setAllowance(BigNumber.from(allowance.toString()) as BigNumber))
        .catch((allowance) => console.error(allowance))
    }
  }, [currentUserAddress, erc20, spender])

  return {
    erc20,
    allowance,
    approve,
    loadingApprove,
    // TODO: allowance.gt(0) may lead to false positives
    //  we need to compare it against the amount to use at least
    hasAllowance: allowance.gt('0'),
  }
}
