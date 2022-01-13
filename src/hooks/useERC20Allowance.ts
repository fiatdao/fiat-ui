import { Contract, ethers } from 'ethers'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { isAddress } from 'ethers/lib/utils'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { contracts } from '@/src/constants/contracts'
import { ERC20 } from '@/types/typechain'
import { ZERO_BN } from '@/src/constants/misc'

export const useERC20Allowance = (tokenAddress: string, spender: string) => {
  const { address: currentUserAddress, web3Provider } = useWeb3Connection()
  const [allowance, setAllowance] = useState(ZERO_BN)
  const [loadingApprove, setLoadingApprove] = useState(false)

  const erc20 = useMemo(
    () =>
      isAddress(tokenAddress) && web3Provider
        ? (new Contract(tokenAddress, contracts.TEST_ERC20.abi, web3Provider?.getSigner()) as ERC20)
        : null,
    [tokenAddress, web3Provider],
  )

  const approve = useCallback(async () => {
    if (erc20 && isAddress(spender)) {
      setLoadingApprove(true)
      return (await erc20.approve(spender, ethers.constants.MaxUint256))
        .wait()
        .then(() => erc20.allowance(currentUserAddress as string, spender))
        .then(setAllowance)
        .finally(() => setLoadingApprove(false))
    }
  }, [currentUserAddress, erc20, spender])

  useEffect(() => {
    if (erc20 && isAddress(spender) && currentUserAddress) {
      erc20.allowance(currentUserAddress, spender).then(setAllowance)
    }
  }, [currentUserAddress, erc20, spender])

  return { erc20, allowance, approve, loadingApprove, hasAllowance: allowance.gt('0') }
}
