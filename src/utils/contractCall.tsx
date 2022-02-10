import { Contract, ContractInterface } from '@ethersproject/contracts'
import { JsonRpcProvider, JsonRpcSigner } from '@ethersproject/providers'
import isDev from '@/src/utils/isDev'

export default async function contractCall<
  MyContract extends Contract,
  Method extends keyof MyContract & string,
>(
  address: string,
  abi: ContractInterface,
  provider: JsonRpcProvider | JsonRpcSigner,
  method: Method,
  params: Parameters<MyContract[Method]> | null,
): Promise<ReturnType<MyContract[Method]> | null> {
  const contract = new Contract(address as string, abi, provider) as MyContract
  try {
    const deployedContract = await contract.deployed()
    const contractMethod = deployedContract[method]
    const result = Array.isArray(params) ? await contractMethod(...params) : await contractMethod()
    if (isDev()) console.log(`result of ${method} with ${params} from contract ${address}`, result)
    return result
  } catch (e) {
    if (isDev()) console.error(`contract is not deployed`, e)
    return null
  }
}
