import { ChainsValues } from '../constants/chains'
import { ChainAppContractInfo, contracts } from '@/src/constants/contracts'
import { AppContracts } from '@/types'

export default function getContractInfoFromContractName(
  chainId: ChainsValues,
  contractName: string,
): ChainAppContractInfo {
  const founded = Object.keys(contracts).includes(contractName)

  if (!founded) {
    throw Error(`There is no contract for name ${contractName}`)
  }

  const contract = contracts[contractName as AppContracts]
  return { ...contract, address: contract.address[chainId] } as ChainAppContractInfo
}
