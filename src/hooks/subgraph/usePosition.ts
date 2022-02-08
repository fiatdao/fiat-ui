import { wranglePositions } from '.'
import useSWR from 'swr'
import { positionById, positionByIdVariables } from '@/types/subgraph/__generated__/positionById'
import { POSITION_BY_ID } from '@/src/queries/position'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'

export const usePosition = (positionId: string) => {
  const { data, mutate } = useSWR(['position-by-id'], () =>
    graphqlFetcher<positionById, positionByIdVariables>(POSITION_BY_ID, { id: positionId }).then(
      ({ position }) => {
        if (position) return wranglePositions({ positions: [position] }).positions[0]
      },
    ),
  )

  return { position: data, refetch: mutate }
}

export type RefetchPositionById = ReturnType<typeof usePosition>['refetch']
