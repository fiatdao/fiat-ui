import { useNotifications } from './useNotifications'
import { Contract, ethers } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { isAddress } from 'ethers/lib/utils'
import BigNumber from 'bignumber.js'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { contracts } from '@/src/constants/contracts'
import { ERC20 } from '@/types/typechain'

export const useERC20Allowance = (tokenAddress: string, spender: string) => {
  const { address: currentUserAddress, web3Provider } = useWeb3Connection()
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

  const updateAllowance = useCallback(async () => {
    if (erc20 && isAddress(spender) && currentUserAddress) {
      const allowance = await erc20.allowance(currentUserAddress as string, spender)
      // need to transform to BigNumber from BigNumber.js
      const allowanceBigNumber = BigNumber.from(allowance.toString()) as BigNumber
      setAllowance(allowanceBigNumber)
    }
  }, [erc20, spender, currentUserAddress])

  const approve = useCallback(async () => {
    if (!erc20) {
      throw new Error('no erc20')
    }
    if (!isAddress(spender)) {
      throw new Error('erc20 spender is not an address')
    }
    try {
      setLoadingApprove(true)
      notification.requestSign()
      const tx = await erc20.approve(spender, ethers.constants.MaxUint256)
      notification.awaitingTx(tx.hash)
      await tx.wait().catch(notification.handleTxError)
      notification.successfulTx(tx.hash)
      updateAllowance()
      setLoadingApprove(false)
    } catch (error) {
      notification.handleTxError(error)
      setLoadingApprove(false)
      throw error
    }
  }, [erc20, spender, updateAllowance, notification])

  useEffect(() => {
    updateAllowance()
  }, [updateAllowance])

  return { erc20, allowance, approve, loadingApprove, hasAllowance: allowance.gt('0') }
}
