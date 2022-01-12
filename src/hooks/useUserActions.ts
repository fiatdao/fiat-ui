import { Contract } from 'ethers'
import { useMemo } from 'react'
import { Chains } from '@/src/constants/chains'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import UserActionsAbi from '@/src/abis/UserActions.json'
import { UserActions } from '@/types/typechain/UserActions'

const USER_ACTIONS = {
  address: {
    [Chains.mainnet]: '',
    [Chains.goerli]: '0xBd43980D5632FA81Dd4597820Ce07E94A944C469',
  },
  abi: UserActionsAbi,
}

export const useUserActions = () => {
  const { web3Provider } = useWeb3Connection()

  return useMemo(
    () =>
      new Contract(
        USER_ACTIONS.address[Chains.goerli],
        USER_ACTIONS.abi,
        web3Provider?.getSigner(),
      ) as UserActions,
    [web3Provider],
  )
}
