import { ChainsValues } from '../constants/chains'
import { Contract } from '@ethersproject/contracts'
import { CollateralAuction } from '@/types/typechain'
import { Await } from '@/types/utils'
import { contracts } from '@/src/constants/contracts'

export default async function callCollateralAuction<
  MethodName extends keyof CollateralAuction['functions'],
  Params extends Parameters<CollateralAuction[MethodName]> | null,
  Return extends Await<ReturnType<CollateralAuction[MethodName]>>,
>(
  provider: any,
  network: ChainsValues,
  method: MethodName,
  params: Params,
): Promise<Return | null> {
  const { abi, address } = contracts.COLLATERAL_AUCTION
  const collateralAuction = new Contract(address[network] as string, abi, provider!)
  const deployedCollateralAuction = await collateralAuction.deployed()
  if (deployedCollateralAuction) {
    const contractMethod = deployedCollateralAuction[method]
    const result = Array.isArray(params) ? await contractMethod(...params) : await contractMethod()
    console.log(`result of ${method} with ${params} is `, result)
    return result
  }
  return null
}
