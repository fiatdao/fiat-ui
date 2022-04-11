import useSWR, { KeyedMutator, SWRConfiguration } from 'swr'
import { Contract, ContractInterface } from '@ethersproject/contracts'
import contractCall from '@/src/utils/contractCall'

import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Await } from '@/types/utils'
import isDev from '@/src/utils/isDev'

export default function useContractCall<
  MyContract extends Contract,
  Method extends keyof MyContract & string,
  Params extends Parameters<MyContract[Method]>,
  Return extends ReturnType<MyContract[Method]>,
>(
  address: string,
  abi: ContractInterface,
  method: Method,
  params: Params | null,
  options?: SWRConfiguration,
): [Await<Return> | null, KeyedMutator<Return>] {
  const { isAppConnected, readOnlyAppProvider, web3Provider } = useWeb3Connection()
  const provider = isAppConnected && web3Provider ? web3Provider.getSigner() : readOnlyAppProvider

  const { data = null, mutate: refetch } = useSWR(
    [method, address, JSON.stringify(params)],
    async (method, address) => {
      if (isDev()) {
        console.log('calling', method, address, params)
      }
      return await contractCall(address, abi, provider, method, params)
    },
    options,
  )

  return [data, refetch]
}
