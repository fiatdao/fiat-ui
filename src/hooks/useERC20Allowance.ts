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

  const erc20 = useMemo(
    () =>
      isAddress(tokenAddress) && web3Provider
        ? (new Contract(tokenAddress, contracts.ERC_20.abi, web3Provider?.getSigner()) as ERC20)
        : null,
    [tokenAddress, web3Provider],
  )

  const approve = useCallback(async () => {
    if (erc20 && isAddress(spender)) {
      setLoadingApprove(true)
      return (
        (await erc20.approve(spender, ethers.constants.MaxUint256))
          .wait()
          .then(() => erc20.allowance(currentUserAddress as string, spender))
          // FixMe: ugh! 'toString', 'as BigNumber'
          .then((allowance) => setAllowance(BigNumber.from(allowance.toString()) as BigNumber))
          .finally(() => setLoadingApprove(false))
      )
    }
  }, [currentUserAddress, erc20, spender])

  useEffect(() => {
    if (erc20 && isAddress(spender) && currentUserAddress) {
      erc20
        .allowance(currentUserAddress, spender)
        // FixMe: more ugh!!
        .then((allowance) => setAllowance(BigNumber.from(allowance.toString()) as BigNumber))
    }
  }, [currentUserAddress, erc20, spender])

  return { erc20, allowance, approve, loadingApprove, hasAllowance: allowance.gt('0') }
}
