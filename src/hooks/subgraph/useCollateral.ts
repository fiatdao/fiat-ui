import { fetchCollateralById } from './useCollaterals'
import useSWR from 'swr'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import isDev from '@/src/utils/isDev'

export const useCollateral = (collateralId: string) => {
  const { appChainId, web3Provider: provider } = useWeb3Connection()

  const { data, error } = useSWR(['collaterals', collateralId], () =>
    provider
      ? fetchCollateralById({
          protocols: undefined,
          collateralId: collateralId,
          provider,
          appChainId,
        })
      : [],
  )

  if (isDev() && error) console.error(error)

  return { data: data && data.length >= 1 ? data[0] : undefined, loading: !error && !data }
}
