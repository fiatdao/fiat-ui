import { wranglePositions } from '.'
import { useUserProxy } from './useUserProxy'
import useSWR from 'swr'
import { USER_POSITIONS } from '@/src/queries/userPositions'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import {
  positionsByUser,
  positionsByUserVariables,
} from '@/types/subgraph/__generated__/positionsByUser'
import { Maybe } from '@/types/utils'

export const fetchUserPositions = (user: string) =>
  graphqlFetcher<positionsByUser, positionsByUserVariables>(USER_POSITIONS, { user }).then(
    ({ userPositions }) => {
      const positions = userPositions.map((p) => p.positions || []).flat(1)
      return wranglePositions({ positions })
    },
  )

export const usePositionsByUser = (userAddress: Maybe<string>) => {
  const { userProxy } = useUserProxy(userAddress)

  const { data } = useSWR(['positions'], () => userProxy && fetchUserPositions(userProxy))

  return { positions: data?.positions, positionTransactions: data?.positionTransactions }
}
