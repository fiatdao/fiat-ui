import { ChainsValues } from '../constants/chains'
import { Collybus } from '@/types/typechain'
import { Await } from '@/types/utils'
import { contracts } from '@/src/constants/contracts'
import { Contract } from '@ethersproject/contracts'

export default async function callCollybus<
  MethodName extends keyof Collybus['functions'],
  Params extends Parameters<Collybus[MethodName]> | null,
  Return extends Await<ReturnType<Collybus[MethodName]>>,
>(
  provider: any,
  network: ChainsValues,
  method: MethodName,
  params: Params,
): Promise<Return | null> {
  const { abi, address } = contracts.COLLYBUS
  const collybus = new Contract(address[network] as string, abi, provider)
  const deployedCollybus = await collybus.deployed()
  if (deployedCollybus) {
    const contractMethod = deployedCollybus[method]
    const result = Array.isArray(params) ? await contractMethod(...params) : await contractMethod()
    return result
  }
  return null
}
