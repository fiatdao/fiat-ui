import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { ChainsValues } from '@/src/constants/chains'
import { USER_PROXY } from '@/src/queries/userProxy'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { userProxy, userProxyVariables } from '@/types/subgraph/__generated__/userProxy'
import { Maybe } from '@/types/utils'
import useSWR from 'swr'

export const fetchUserProxy = (appChainId: ChainsValues, address: string) =>
  graphqlFetcher<userProxy, userProxyVariables>(appChainId, USER_PROXY, { id: address })

export const useUserProxy = (address: Maybe<string>) => {
  const { appChainId } = useWeb3Connection()
  const { data } = useSWR(['user-proxy', appChainId, address], () => {
    if (address) {
      return fetchUserProxy(appChainId, address)
    }
  })

  return { userProxy: data?.userProxy?.proxyAddress }
}
