import { usePositions } from './usePositions'
import useUserProxy from '@/src/hooks/useUserProxy'

export const usePositionsByUser = () => {
  const { userProxyAddress } = useUserProxy()
  const { positions = [] } = usePositions(undefined, userProxyAddress ?? '')

  return { positions, positionTransactions: [] }
}
