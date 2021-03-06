import useContractCall from '@/src/hooks/contracts/useContractCall'
import { Interface } from 'ethers/lib/utils'

export const useTokenSymbol = (tokenAddress: string): { tokenSymbol: string } => {
  // TODO: this is going to be a problem if the `tokenAddress` is not a valid address
  const [tokenSymbol = ''] = useContractCall(
    tokenAddress,
    new Interface(['function symbol() view returns (string)']),
    'symbol',
    null,
  )

  return { tokenSymbol }
}
