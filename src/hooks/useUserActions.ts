import { Contract } from 'ethers'
import { useMemo } from 'react'
import { contracts } from '@/src/constants/contracts'
import { Chains } from '@/src/constants/chains'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { UserActions20 } from '@/types/typechain/UserActions20'

export const useUserActions = () => {
  const { web3Provider } = useWeb3Connection()

  return useMemo(
    () =>
      new Contract(
        // TODO: add support for UA1155 (??)
        contracts.USER_ACTIONS_20.address[Chains.goerli],
        contracts.USER_ACTIONS_20.abi,
        web3Provider?.getSigner(),
      ) as UserActions20,
    [web3Provider],
  )
}
