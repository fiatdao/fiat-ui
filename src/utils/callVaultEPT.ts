import { Contract } from '@ethersproject/contracts'
import { Web3Provider } from '@ethersproject/providers'
import { Vault20 } from '@/types/typechain'
import { Await } from '@/types/utils'
import { contracts } from '@/src/constants/contracts'

export default async function vaultEPTCall<
  MethodName extends keyof Vault20['functions'],
  Params extends Parameters<Vault20[MethodName]> | null,
  Return extends Await<ReturnType<Vault20[MethodName]>>,
>(
  address: string,
  provider: Web3Provider,
  method: MethodName,
  params: Params,
): Promise<Return | null> {
  const { abi } = contracts.VAULT_20
  const vaultEPT = new Contract(address as string, abi, provider)
  const deployedVaultEPT = await vaultEPT.deployed()
  if (deployedVaultEPT) {
    const contractMethod = deployedVaultEPT[method]
    const result = Array.isArray(params) ? await contractMethod(...params) : await contractMethod()
    console.log(`result of ${method} with ${params} is `, result)
    return result
  }
  return null
}
