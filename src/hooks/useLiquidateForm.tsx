import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNotifications } from '@/src/hooks/useNotifications'
import { NoLossCollateralAuctionActions } from '@/types/typechain'
import { TransactionError } from '@/src/utils/TransactionError'
import { contracts } from '@/src/constants/contracts'
import { useERC20Allowance } from '@/src/hooks/useERC20Allowance'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connected } from '@/src/providers/web3ConnectionProvider'
import { AuctionData } from '@/src/utils/data/auctions'
import { Maybe } from '@/types/utils'

export const useLiquidateForm = (auctionData?: AuctionData) => {
  const notification = useNotifications()

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

  const { address: userAddress, appChainId, isAppConnected, web3Provider } = useWeb3Connected()
  const { userProxy, userProxyAddress } = useUserProxy()

  const { approve, hasAllowance, loadingApprove } = useERC20Allowance(
    auctionData?.collateral.address ?? '',
    userProxyAddress ?? '',
  )

  const noLossCollateralAuctionActions = useMemo(
    () =>
      new Contract(
        contracts.NO_LOSS_COLLATERAL_AUCTION_ACTIONS.address[appChainId],
        contracts.NO_LOSS_COLLATERAL_AUCTION_ACTIONS.abi,
        web3Provider.getSigner(),
      ) as NoLossCollateralAuctionActions,
    [appChainId, web3Provider],
  )

  const liquidate = useCallback(
    async ({
      collateralAmountToSend,
      maxPrice,
    }: {
      collateralAmountToSend: BigNumber
      maxPrice: BigNumber
    }) => {
      try {
        if (!isAppConnected) {
          notification.appNotConnected()
          return
        }

        if (!userProxy || !userProxyAddress) {
          throw new Error('no userProxy available')
        }

        if (!auctionData) {
          throw new Error('missing auction data')
        }

        setTxStatus((prev) => ({ ...prev, loading: true }))

        const takeCollateral = noLossCollateralAuctionActions.interface.encodeFunctionData(
          'takeCollateral',
          [
            auctionData.vault?.address as string,
            auctionData.tokenId as string,
            userAddress,
            auctionData.id,
            collateralAmountToSend.toFixed(),
            maxPrice.toFixed(),
            userAddress,
          ],
        )

        notification.requestSign()

        const tx: TransactionResponse | TransactionError = await userProxy.execute(
          noLossCollateralAuctionActions.address,
          takeCollateral,
          {
            gasLimit: 1_000_000,
          },
        )

        if (tx instanceof TransactionError) {
          throw tx
        }

        // awaiting exec
        notification.awaitingTx(tx.hash)

        const receipt = await tx.wait()

        // tx successful
        notification.successfulTx(tx.hash)

        return receipt
      } catch (err: any) {
        setTxStatus((prev) => ({ ...prev, error: err }))
        notification.handleTxError(err)
      } finally {
        setTxStatus((prev) => ({ ...prev, loading: false }))
      }
    },
    [
      auctionData,
      isAppConnected,
      noLossCollateralAuctionActions.address,
      noLossCollateralAuctionActions.interface,
      notification,
      userAddress,
      userProxy,
      userProxyAddress,
    ],
  )

  useEffect(() => {
    setTxStatus((prev) => ({ ...prev, loading: loadingApprove }))
  }, [loadingApprove])

  // resets the status
  useEffect(() => () => setTxStatus(initialState), [initialState])

  return { approve, hasAllowance, liquidate, ...txStatus }
}
