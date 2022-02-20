import useTransaction from './useTransaction'
import { ContractReceipt } from '@ethersproject/contracts'
import { AppContractInfo } from '@/src/constants/contracts'
import { ERC20 } from '@/types/typechain'

export default function useERC20Transaction<
  MethodName extends keyof ERC20['functions'],
  Params extends Parameters<ERC20[MethodName]>,
>(
  contract: AppContractInfo,
  method: MethodName,
): (...params: Params) => Promise<ContractReceipt | null> {
  return useTransaction(contract, method)
}
