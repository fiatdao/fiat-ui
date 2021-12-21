import { Interface } from 'ethers/lib/utils'
import { useRouter } from 'next/router'
import useContractCall from '@/src/hooks/contracts/useContractCall'

export const useTokenSymbol = () => {
  const {
    query: { positionId },
  } = useRouter()
  // TODO: this is going to be a problem if the positionId is not a valid address
  const [tokenSymbol = ''] = useContractCall(
    positionId as string,
    new Interface(['function symbol() view returns (string)']),
    'symbol',
    null,
  )

  return { tokenSymbol, tokenAddress: positionId }
}
