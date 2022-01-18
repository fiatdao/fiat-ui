import { Contract } from '@ethersproject/contracts'
import { Tranche } from '@/types/typechain'
import { Await } from '@/types/utils'
import { contracts } from '@/src/constants/contracts'

import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

export default async function trancheCall<
  MethodName extends keyof Tranche['functions'],
  Params extends Parameters<Tranche[MethodName]> | null,
  Return extends Await<ReturnType<Tranche[MethodName]>>,
>(address: string, provider: any, method: MethodName, params: Params): Promise<Return | null> {
  const { abi } = contracts.TRANCHE
  const tranche = new Contract(address as string, abi, provider!)
  const deployedTranche = await tranche.deployed()
  if (deployedTranche) {
    const contractMethod = deployedTranche[method]
    const result = Array.isArray(params) ? await contractMethod(...params) : await contractMethod()
    console.log(`result of ${method} with ${params} is `, result)
    return result
  }
  return null
}
