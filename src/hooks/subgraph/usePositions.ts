import { wranglePositions } from '.'
import useSWR from 'swr'
import { POSITIONS } from '@/src/queries/positions'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { positions } from '@/types/subgraph/__generated__/positions'

export const fetchPositions = () =>
  graphqlFetcher<positions>(POSITIONS).then((positions) => {
    return wranglePositions(positions)
  })

export const usePositions = () => {
  const { data } = useSWR(['positions'], () => fetchPositions())

  return { positions: data?.positions, positionTransactions: data?.positionTransactions }
}
