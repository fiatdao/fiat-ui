import { usePositionsByUser } from '@/src/hooks/subgraph/usePositionsByUser'

export const usePositionsBadge = () => {
  // TODO this can be better without fetching data on chain only to get length

  const { positions } = usePositionsByUser()
  return positions.length
}
