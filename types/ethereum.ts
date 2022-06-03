import { Await } from '@/types/utils'
import { Contract } from '@ethersproject/contracts'

export type ContractReturnType<
  ContractType extends Contract,
  MethodName extends keyof ContractType,
> = Await<ReturnType<ContractType[MethodName]>>
