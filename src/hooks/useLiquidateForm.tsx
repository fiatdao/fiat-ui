import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useUserActions } from '@/src/hooks/useUserActions'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { SLIPPAGE_VALUE } from '@/src/constants/auctions'
import { useFIATBalance } from '@/src/hooks/useFIATBalance'
import { WAD_DECIMALS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
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
    contracts.FIAT.address[appChainId],
    userProxyAddress ?? '',
  )

  const { approveFIAT } = useUserActions()
  const [hasMonetaAllowance, setHasMonetaAllowance] = useState<boolean>(false)
  const [monetaFiatAllowance] = useContractCall(
    contracts.FIAT.address[appChainId],
    contracts.FIAT.abi,
    'allowance',
    [userProxyAddress, contracts.MONETA.address[appChainId]],
  )

  useEffect(() => {
    setHasMonetaAllowance(monetaFiatAllowance?.gt(ZERO_BIG_NUMBER) ?? false)
  }, [monetaFiatAllowance])

  const approveMoneta = useCallback(async () => {
    try {
      await approveFIAT(contracts.MONETA.address[appChainId])
      setHasMonetaAllowance(true)
    } catch (err) {
      notification.handleTxError(err)
    }
  }, [approveFIAT, appChainId, notification])

  const [FIATBalance] = useFIATBalance()

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
        notification.successfulGenericTx(tx.hash)

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

  const maxPrice = useMemo(
    () =>
      auctionData?.bidPrice
        ?.multipliedBy(SLIPPAGE_VALUE.plus(1))
        .decimalPlaces(WAD_DECIMALS)
        .scaleBy(WAD_DECIMALS) ?? ZERO_BIG_NUMBER,
    [auctionData?.bidPrice],
  )

  const maxCredit = useMemo(() => {
    const maxToSell = auctionData?.collateralToSell?.multipliedBy(
      BigNumber.from(1).minus(SLIPPAGE_VALUE),
    )

    if (!maxToSell || maxPrice.eq(ZERO_BIG_NUMBER)) {
      return
    }

    const maxToPay = FIATBalance.unscaleBy(WAD_DECIMALS).multipliedBy(
      BigNumber.from(1).minus(SLIPPAGE_VALUE),
    )

    if (maxToPay.lt(maxToSell)) {
      return maxToPay.dividedBy(maxPrice.unscaleBy(WAD_DECIMALS))
    }

    return maxToSell.dividedBy(maxPrice.unscaleBy(WAD_DECIMALS))
  }, [auctionData?.collateralToSell, maxPrice, FIATBalance])

  return {
    approve,
    approveMoneta,
    hasAllowance,
    hasMonetaAllowance,
    liquidate,
    maxPrice,
    maxCredit,
    ...txStatus,
  }
}
