import { Interface } from 'ethers/lib/utils'
import useContractCall from '@/src/hooks/contracts/useContractCall'

export const useTokenSymbol = (tokenAddress: string) => {
  // TODO: this is going to be a problem if the `tokenAddress` is not a valid address
  const [tokenSymbol = ''] = useContractCall(
    tokenAddress,
    new Interface(['function symbol() view returns (string)']),
    'symbol',
    null,
  )

  return { tokenSymbol }
}
