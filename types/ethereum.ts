import { Contract } from '@ethersproject/contracts'
import { Await } from '@/types/utils'

export type ContractReturnType<
  ContractType extends Contract,
  MethodName extends keyof ContractType,
> = Await<ReturnType<ContractType[MethodName]>>
