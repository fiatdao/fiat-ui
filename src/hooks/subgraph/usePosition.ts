import { Position, wrangePositions } from '.'
import { useEffect, useState } from 'react'
import { useQuery } from '@apollo/client'
import { positionById, positionByIdVariables } from '@/types/subgraph/__generated__/positionById'
import { POSITION } from '@/src/queries/position'
import { Maybe } from '@/types/utils'

/**
 * Fetches Position information by its ID
 *
 * @param {string} positionId
 * @returns {Promise<[Position>]>}
 */
export const usePosition = (positionId: string) => {
  const [position, setPosition] = useState<Maybe<Position>>(null)

  const { data, refetch } = useQuery<positionById, positionByIdVariables>(POSITION, {
    variables: { id: positionId },
  })

  useEffect(() => {
    if (!data || !data.position) {
      return
    }

    const { positions } = wrangePositions({ positions: [data.position] })

    setPosition(positions[0])
  }, [data])

  return { position, refetch: () => refetch({ id: positionId }) }
}

export type RefetchPositionById = ReturnType<typeof usePosition>['refetch']
