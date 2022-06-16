import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { COLLATERALS } from '@/src/queries/collaterals'
import { Collaterals, CollateralsVariables } from '@/types/subgraph/__generated__/Collaterals'
import { ChainsValues } from '@/src/constants/chains'
import useSWR from 'swr'

type UseTokenSymbol = {
  tokenSymbol?: string
  loading: boolean
  error: any
}

function fetchTokenSymbol(tokenAddress: string, appChainId: ChainsValues) {
  return graphqlFetcher<Collaterals, CollateralsVariables>(appChainId, COLLATERALS).then(
    async ({ collateralTypes }) => {
      const symbols = collateralTypes
        .map((c) => {
          if (c.address === tokenAddress) return c.symbol
          if (c.underlierAddress === tokenAddress) return c.underlierSymbol
        })
        .filter((s) => typeof s === 'string') as string[]
      return symbols.length ? symbols[0] : ''
    },
  )
}

export const useTokenSymbol = (tokenAddress: string): UseTokenSymbol => {
  const { appChainId } = useWeb3Connection()
  const { data, error } = useSWR(['token-symbol', tokenAddress], () =>
    fetchTokenSymbol(tokenAddress, appChainId),
  )

  return { tokenSymbol: data, error, loading: !data && !error }
}
