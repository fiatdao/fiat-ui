import { usePositions } from './usePositions'
import useUserProxy from '@/src/hooks/useUserProxy'

export const usePositionsByUser = () => {
  const { userProxyAddress } = useUserProxy()
  console.log({ userProxyAddress })
  const { positions = [] } = usePositions(undefined, userProxyAddress ?? '')

  return { positions, positionTransactions: [] }
}
