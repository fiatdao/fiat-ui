import { usePositions } from './usePositions'
import useUserProxy from '../useUserProxy'

export const usePositionsByUser = () => {
  const { userProxyAddress } = useUserProxy()
  const { positions = [], loading } = usePositions(undefined, userProxyAddress ?? '')
  return { positions, loading }
}
