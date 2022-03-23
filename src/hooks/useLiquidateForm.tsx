import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { contracts } from '@/src/constants/contracts'
import useTransaction from '@/src/hooks/contracts/useTransaction'
import { useERC20Allowance } from '@/src/hooks/useERC20Allowance'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connected } from '@/src/providers/web3ConnectionProvider'
import { AuctionData } from '@/src/utils/data/auctions'
import { Maybe } from '@/types/utils'

export const useLiquidateForm = (liquidateData?: AuctionData) => {
  const initialState = useMemo(
    () => ({
      loading: false,
      error: null,
    }),
    [],
  )

  const [txStatus, setTxStatus] = useState<{
    loading: boolean
    error: Maybe<Error>
  }>(initialState)

  const { address: currentUserAddress } = useWeb3Connected()
  const { userProxyAddress } = useUserProxy()

  const { approve, hasAllowance, loadingApprove } = useERC20Allowance(
    liquidateData?.tokenAddress as string,
    currentUserAddress,
  )

  const takeCollateralTx = useTransaction(
    contracts.NO_LOSS_COLLATERAL_AUCTION_ACTIONS,
    'takeCollateral',
  )

  const liquidate = useCallback(
    async ({
      collateralAmountToSend,
      maxPrice,
    }: {
      collateralAmountToSend: BigNumber
      maxPrice: BigNumber
    }) => {
      setTxStatus((prev) => ({ ...prev, loading: true }))

      try {
        await takeCollateralTx(
          liquidateData?.vault?.address,
          liquidateData?.tokenId,
          userProxyAddress,
          liquidateData?.auction.id,
          collateralAmountToSend.toFixed(),
          maxPrice.toFixed(),
          userProxyAddress,
        )
      } catch (err: any) {
        setTxStatus((prev) => ({ ...prev, error: err }))
      } finally {
        setTxStatus((prev) => ({ ...prev, loading: false }))
      }
    },
    [liquidateData, takeCollateralTx, userProxyAddress],
  )

  useEffect(() => {
    setTxStatus((prev) => ({ ...prev, loading: loadingApprove }))
  }, [loadingApprove])

  // resets the status
  useEffect(() => () => setTxStatus(initialState), [initialState])

  return { approve, hasAllowance, liquidate, ...txStatus }
}
