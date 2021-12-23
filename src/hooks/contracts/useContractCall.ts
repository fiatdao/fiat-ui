import { isAddress } from 'ethers/lib/utils'
import useSWR, { SWRConfiguration } from 'swr'
import { Contract, ContractInterface } from '@ethersproject/contracts'

import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Await } from '@/types/utils'
import isDev from '@/src/utils/isDev'

export default function useContractCall<
  MyContract extends Contract,
  Method extends keyof MyContract,
  //Params extends Parameters<MyContract[Method]>,
  Params extends any[],
  Return extends ReturnType<MyContract[Method]>,
>(
  address: string,
  abi: ContractInterface,
  method: Method,
  params: Params | null, // TODO: fix me later replacing any by Params
  options?: SWRConfiguration,
): [Await<Return> | null, () => void] {
  const { isAppConnected, readOnlyAppProvider, web3Provider } = useWeb3Connection()
  const provider = isAppConnected ? web3Provider?.getSigner() : readOnlyAppProvider

  const { data = null, mutate: refetch } = useSWR(
    [method, address, JSON.stringify(params)],
    async (method, address) => {
      if (isDev()) {
        console.log('calling', method, address, params)
      }
      const contract = new Contract(address as string, abi, provider) as MyContract
      return params === null ? contract[method]() : contract[method](...params)
    },
    options,
  )

  return [data, refetch]
}
