import { USER_PROXY } from '@/src/queries/userProxy'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { userProxy, userProxyVariables } from '@/types/subgraph/__generated__/userProxy'
import { Maybe } from '@/types/utils'
import useSWR from 'swr'

export const fetchUserProxy = (address: string) =>
  graphqlFetcher<userProxy, userProxyVariables>(USER_PROXY, { id: address })

export const useUserProxy = (address: Maybe<string>) => {
  const { data } = useSWR(['user-proxy'], () => {
    if (address) return fetchUserProxy(address)
  })

  return { userProxy: data?.userProxy?.proxyAddress }
}
