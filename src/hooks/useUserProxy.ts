import { useCallback, useMemo, useState } from 'react'
import { Contract } from 'ethers'
import { contracts } from '@/src/constants/contracts'
import { ZERO_ADDRESS } from '@/src/constants/misc'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { PRBProxy as PRBProxyType } from '@/types/typechain'

const useUserProxy = () => {
  const {
    address: currentUserAddress,
    appChainId,
    isAppConnected,
    web3Provider,
  } = useWeb3Connection()
  const [loadingProxy, setLoadingProxy] = useState(false)

  const [proxyAddress, refetch] = useContractCall<
    PRBProxyType,
    'getCurrentProxy',
    [string],
    Promise<string>
  >(contracts.PRB_Proxy.address[appChainId], contracts.PRB_Proxy.abi, 'getCurrentProxy', [
    currentUserAddress as string,
  ])

  const setupProxy = useCallback(async () => {
    if (isAppConnected && web3Provider) {
      setLoadingProxy(true)
      const prbProxy = new Contract(
        contracts.PRB_Proxy.address[appChainId],
        contracts.PRB_Proxy.abi,
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
  }, [appChainId, isAppConnected, refetch, web3Provider])

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
    isProxyAvailable: proxyAddress !== ZERO_ADDRESS,
  }
}

export default useUserProxy
