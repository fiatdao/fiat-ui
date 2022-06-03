import { useNotifications } from './useNotifications'
import { ChainsValues } from '../constants/chains'
import { contracts } from '@/src/constants/contracts'
import { ZERO_ADDRESS } from '@/src/constants/misc'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { userProxies, userProxiesVariables } from '@/types/subgraph/__generated__/userProxies'
import { USER_PROXIES } from '@/src/queries/userProxies'
import useSWR from 'swr'
import { useCallback, useMemo, useState } from 'react'
import { Contract } from 'ethers'

const fetchUserProxies = (appChainId: ChainsValues, address: string) =>
  graphqlFetcher<userProxies, userProxiesVariables>(appChainId, USER_PROXIES, {
    where: {
      owner: address,
    },
  })

const useUserProxy = () => {
  const {
    address: currentUserAddress,
    appChainId,
    isAppConnected,
    web3Provider,
  } = useWeb3Connection()
  const [loadingProxy, setLoadingProxy] = useState(false)
  const notification = useNotifications()

  const { data: proxyAddress, mutate: refetch } = useSWR(
    ['user-proxies', appChainId, currentUserAddress],
    async () => {
      if (currentUserAddress) {
        const data = await fetchUserProxies(appChainId, currentUserAddress)
        return data.userProxies.length ? data.userProxies[0].proxyAddress : ZERO_ADDRESS
      }
      return ZERO_ADDRESS
    },
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
