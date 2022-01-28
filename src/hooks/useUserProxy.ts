import { useCallback, useMemo, useState } from 'react'
import { Contract } from 'ethers'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { Chains } from '@/src/constants/chains'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { DEFAULT_ADDRESS } from '@/src/web3/utils'
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
  const [loadingProxy, setLoadingProxy] = useState(false)

  const [proxyAddress, refetch] = useContractCall<
    PRBProxyType,
    'getCurrentProxy',
    [string],
    Promise<string>
  >(PRB_PROXY.address[Chains.goerli], PRB_PROXY.abi, 'getCurrentProxy', [
    currentUserAddress as string,
  ])

  const setupProxy = useCallback(async () => {
    if (isAppConnected && web3Provider) {
      setLoadingProxy(true)
      const prbProxy = new Contract(
        PRB_PROXY.address[Chains.goerli],
        PRB_PROXY.abi,
        web3Provider.getSigner(),
      )

      try {
        await (await prbProxy.deploy()).wait()
        refetch()
      } catch (e) {
        console.error('Failed to setup the Proxy', e)
      } finally {
        setLoadingProxy(false)
      }
    }
  }, [isAppConnected, refetch, web3Provider])

  const userProxy = useMemo(() => {
    if (!proxyAddress || !web3Provider) {
      return null
    }
    return new Contract(
      proxyAddress,
      [
        'function execute(address target, bytes calldata data) external payable returns (bytes memory response)',
      ],
      web3Provider.getSigner(),
    )
  }, [proxyAddress, web3Provider])

  // isProxyAvailable: !!userProxy
  return {
    userProxy,
    setupProxy,
    userProxyAddress: proxyAddress,
    loadingProxy,
    isProxyAvailable: proxyAddress !== DEFAULT_ADDRESS,
  }
}

export default useUserProxy
