import useContractCall from './useContractCall'

import { ChainAppContractInfo } from '@/src/constants/contracts'
import { ERC20 } from '@/types/typechain'
import { Await } from '@/types/utils'

export default function useERC20Call<
  MethodName extends keyof ERC20['functions'],
  Params extends Parameters<ERC20[MethodName]> | null,
  Return extends Await<ReturnType<ERC20[MethodName]>>,
>(contract: ChainAppContractInfo, method: MethodName, params: Params): [Return | null, () => void] {
  const [data, refetch] = useContractCall(contract.address, contract.abi, method, params)
  return [data, refetch]
}
