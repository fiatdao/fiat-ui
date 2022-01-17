import { Contract } from '@ethersproject/contracts'
import { VaultEPT } from '@/types/typechain'
import { Await } from '@/types/utils'
import { contracts } from '@/src/constants/contracts'

export default async function vaultEPTCall<
  MethodName extends keyof VaultEPT['functions'],
  Params extends Parameters<VaultEPT[MethodName]> | null,
  Return extends Await<ReturnType<VaultEPT[MethodName]>>,
>(address: string, provider: any, method: MethodName, params: Params): Promise<Return | null> {
  const { abi } = contracts.VAULT_EPT
  const vaultEPT = new Contract(address as string, abi, provider!)
  const deployedVaultEPT = await vaultEPT.deployed()
  if (deployedVaultEPT) {
    const contractMethod = deployedVaultEPT[method]
    const result = Array.isArray(params) ? await contractMethod(...params) : await contractMethod()
    console.log(`result of ${method} with ${params} is `, result)
    return result
  }
  return null
}
