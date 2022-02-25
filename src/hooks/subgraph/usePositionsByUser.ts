import { usePositions } from './usePositions'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

export const usePositionsByUser = () => {
  const { address } = useWeb3Connection()
  const { positions = [], loading } = usePositions(undefined, address ?? '')

  return { positions, loading }
}
