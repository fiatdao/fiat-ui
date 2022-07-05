import { useNotifications } from './useNotifications'
import { contracts } from '@/src/constants/contracts'
import { ZERO_ADDRESS } from '@/src/constants/misc'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { PRBProxyRegistry } from '@/types/typechain'
import { Contract } from 'ethers'
import { useCallback, useMemo, useState } from 'react'

const useUserProxy = () => {
  const {
    address: currentUserAddress,
    appChainId,
    isAppConnected,
    web3Provider,
  } = useWeb3Connection()
  const [loadingProxy, setLoadingProxy] = useState(false)
  const notification = useNotifications()

  const [proxyAddress, refetch] = useContractCall<
    PRBProxyRegistry,
    'getCurrentProxy',
    [string],
    Promise<string>
  >(
    contracts.PRB_PROXY_REGISTRY.address[appChainId],
    contracts.PRB_PROXY_REGISTRY.abi,
    'getCurrentProxy',
    [currentUserAddress as string],
  )

  const setupProxy = useCallback(async () => {
    if (isAppConnected && web3Provider) {
      setLoadingProxy(true)
      const prbProxy = new Contract(
        contracts.PRB_PROXY_REGISTRY.address[appChainId],
        contracts.PRB_PROXY_REGISTRY.abi,
        web3Provider.getSigner(),
      )

      try {
        notification.requestSign()
        const tx = await prbProxy.deploy()
        notification.awaitingTx(tx.hash)
        await tx.wait().catch(notification.handleTxError)
        notification.successfulTx(tx.hash)
        refetch()
      } catch (e) {
        notification.handleTxError(e)
        console.error('Failed to setup the Proxy', e)
      } finally {
        setLoadingProxy(false)
      }
    }
  }, [appChainId, isAppConnected, refetch, web3Provider, notification])

  const userProxy = useMemo(() => {
    if (!proxyAddress || !web3Provider) {
      return null
    }
    return new Contract(proxyAddress, contracts.PRB_PROXY.abi, web3Provider.getSigner())
  }, [proxyAddress, web3Provider])

  return {
    userProxy,
    setupProxy,
    userProxyAddress: proxyAddress,
    loadingProxy,
    isProxyAvailable: proxyAddress !== ZERO_ADDRESS,
  }
}

export default useUserProxy
