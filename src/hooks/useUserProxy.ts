import useContractCall from './contracts/useContractCall'
import { Chains } from '../constants/chains'
import { useWeb3Connection } from '../providers/web3ConnectionProvider'
import { DEFAULT_ADDRESS } from '../web3/utils'
import { useCallback, useMemo, useState } from 'react'
import { Contract } from 'ethers'
import PRBProxy from '@/src/abis/PRBProxy.json'
import { PRBProxy as PRBProxyType } from '@/types/typechain'

const PRB_PROXY = {
  address: {
    [Chains.mainnet]: '',
    [Chains.goerli]: '0xc918902ef2f428f2dc77e3b4b5e5e153aab9d1b0',
  },
  abi: PRBProxy,
}

const useUserProxy = () => {
  const { address: currentUserAddress, isAppConnected, web3Provider } = useWeb3Connection()

  const [proxyAddress] = useContractCall<
    PRBProxyType,
    'getCurrentProxy',
    [string],
    Promise<string>
  >(PRB_PROXY.address[Chains.goerli], PRB_PROXY.abi, 'getCurrentProxy', [
    currentUserAddress as string,
  ])

  const [userProxyAddress, setUserProxyAddress] = useState<string>(proxyAddress || DEFAULT_ADDRESS)

  const setupProxy = useCallback(async () => {
    if (isAppConnected && web3Provider) {
      const prbProxy = new Contract(
        PRB_PROXY.address[Chains.goerli],
        PRB_PROXY.abi,
        web3Provider.getSigner(),
      )
      setUserProxyAddress(await (await prbProxy.deploy()).wait())
    }
  }, [isAppConnected, web3Provider])

  const userProxy = useMemo(() => {
    if (!userProxyAddress || !web3Provider) {
      return null
    }
    return new Contract(
      userProxyAddress,
      [
        'function execute(address target, bytes calldata data) external payable returns (bytes memory response)',
      ],
      web3Provider.getSigner(),
    )
  }, [userProxyAddress, web3Provider])

  // userProxyAddress: userProxy.address
  // isProxyAvailable: !!userProxy
  return {
    userProxy,
    setupProxy,
    userProxyAddress,
    isProxyAvailable: userProxyAddress !== DEFAULT_ADDRESS,
  }
}

export default useUserProxy
