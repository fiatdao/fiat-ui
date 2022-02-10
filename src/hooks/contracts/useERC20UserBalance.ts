import useERC20Call from './useERC20Call'
import useContractInfo from './useContractInfo'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { formatTokenValue } from '@/src/utils/formats'
import { ZERO_ADDRESS } from '@/src/constants/misc'
import { AppContracts } from '@/types/protocols'

export default function useERC20UserBalance(token: AppContracts) {
  const { address } = useWeb3Connection()
  const tokenContractInfo = useContractInfo(token)

  const [balance, refetch] = useERC20Call(tokenContractInfo, 'balanceOf', [address || ZERO_ADDRESS])
  const balanceFormatted = formatTokenValue(balance, tokenContractInfo.decimals)

  return { refetch, balance, balanceFormatted }
}
