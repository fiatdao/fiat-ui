import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { ChainAppContractInfo, contracts } from '@/src/constants/contracts'
import { AppContracts } from '@/types/protocols'

export default function useContractInfo(contract: AppContracts): ChainAppContractInfo {
  const { appChainId } = useWeb3Connection()

  const ci = contracts[contract]
  return { ...ci, address: ci.address[appChainId] } as ChainAppContractInfo
}
