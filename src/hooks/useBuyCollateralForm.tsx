import { useUserActions } from '@/src/hooks/useUserActions'

import useContractCall from '@/src/hooks/contracts/useContractCall'
import { SLIPPAGE } from '@/src/constants/auctions'
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
import { estimateGasLimit } from '@/src/web3/utils'
import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'

export const useBuyCollateralForm = (auctionData?: AuctionData) => {
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

  const { approveFIAT } = useUserActions(auctionData?.vault?.type)

  const [loadingMonetaApprove, setLoadingMonetaApprove] = useState(false)
  const [hasMonetaAllowance, setHasMonetaAllowance] = useState(false)

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
      setLoadingMonetaApprove(true)
      await approveFIAT(contracts.MONETA.address[appChainId])
      setHasMonetaAllowance(true)
    } catch (err) {
      notification.handleTxError(err)
    } finally {
      setLoadingMonetaApprove(false)
    }
  }, [approveFIAT, appChainId, notification])

  const [FIATBalance] = useFIATBalance(true)

  const noLossCollateralAuctionActions = useMemo(
    () =>
      new Contract(
        contracts.NO_LOSS_COLLATERAL_AUCTION_ACTIONS.address[appChainId],
        contracts.NO_LOSS_COLLATERAL_AUCTION_ACTIONS.abi,
        web3Provider.getSigner(),
      ) as NoLossCollateralAuctionActions,
    [appChainId, web3Provider],
  )

  const buyCollateral = useCallback(
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
            gasLimit: await estimateGasLimit(userProxy, 'execute', [
              noLossCollateralAuctionActions.address,
              takeCollateral,
            ]),
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
    setTxStatus((prev) => ({ ...prev, loading: loadingApprove || loadingMonetaApprove }))
  }, [loadingApprove, loadingMonetaApprove])

  // resets the status
  useEffect(() => () => setTxStatus(initialState), [initialState])

  const maxPrice = useMemo(
    () =>
      auctionData?.currentAuctionPrice?.decimalPlaces(WAD_DECIMALS).scaleBy(WAD_DECIMALS) ??
      ZERO_BIG_NUMBER,
    [auctionData?.currentAuctionPrice],
  )

  const maxCredit = useMemo(() => {
    const maxToSell = auctionData?.auctionedCollateral

    if (!maxToSell || maxPrice.eq(ZERO_BIG_NUMBER)) {
      return
    }

    const maxToPay = FIATBalance

    // If your FIAT buying power is not enough to buy out the whole auction,
    // max should be the max amount of collateral you can afford to buy (maxToPay / maxPrice)
    if (maxToPay.lt(maxToSell)) {
      return maxToPay.dividedBy(maxPrice.unscaleBy(WAD_DECIMALS))
    }

    // If your FIAT buying power is enough to buy out the whole auction,
    // max should be the total collateral being auctioned
    return auctionData?.auctionedCollateral
  }, [auctionData?.auctionedCollateral, maxPrice, FIATBalance])

  // below were some values including slippage calculations
  // Q: Why would max price factor in positive slippage?
  // Isn't there a constantly _decreasing_ value of auctioned collateral (till redo)?
  const oldMaxPrice = useMemo(
    () =>
      auctionData?.currentAuctionPrice
        ?.multipliedBy(SLIPPAGE.plus(1))
        .decimalPlaces(WAD_DECIMALS)
        .scaleBy(WAD_DECIMALS) ?? ZERO_BIG_NUMBER,
    [auctionData?.currentAuctionPrice],
  )

  const oldMaxCredit = useMemo(() => {
    const maxToSell = auctionData?.auctionedCollateral?.multipliedBy(
      BigNumber.from(1).minus(SLIPPAGE),
    )

    if (!maxToSell || oldMaxPrice.eq(ZERO_BIG_NUMBER)) {
      return
    }

    const maxToPay = FIATBalance.multipliedBy(BigNumber.from(1).minus(SLIPPAGE))

    // If your FIAT buying power is not enough to buy out the whole auction,
    // max should be the max amount of collateral you can afford to buy (maxToPay / oldMaxPrice)
    if (maxToPay.lt(maxToSell)) {
      return maxToPay.dividedBy(oldMaxPrice.unscaleBy(WAD_DECIMALS))
    }

    // Q: If your FIAT buying power is enough to buy out the whole auction,
    // max should be <???> (auctionedCollateral/currentAuctionPrice OR debt/currentAuctionPrice)
    return maxToSell.dividedBy(oldMaxPrice.unscaleBy(WAD_DECIMALS))
  }, [auctionData?.auctionedCollateral, oldMaxPrice, FIATBalance])

  return {
    approve,
    approveMoneta,
    hasAllowance,
    hasMonetaAllowance,
    buyCollateral,
    maxPrice,
    maxCredit,
    oldMaxCredit,
    oldMaxPrice,
    ...txStatus,
  }
}
