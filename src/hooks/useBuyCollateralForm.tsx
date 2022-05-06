import { Contract } from '@ethersproject/contracts'
import { TransactionResponse } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
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

  const { approveFIAT } = useUserActions(auctionData?.collateral)
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
      auctionData?.currentAuctionPrice
        ?.multipliedBy(SLIPPAGE.plus(1))
        .decimalPlaces(WAD_DECIMALS)
        .scaleBy(WAD_DECIMALS) ?? ZERO_BIG_NUMBER,
    [auctionData?.currentAuctionPrice],
  )

  const maxCredit = useMemo(() => {
    const maxToSell = auctionData?.auctionedCollateral?.multipliedBy(
      BigNumber.from(1).minus(SLIPPAGE),
    )

    if (!maxToSell || maxPrice.eq(ZERO_BIG_NUMBER)) {
      return
    }

    const maxToPay = FIATBalance.unscaleBy(WAD_DECIMALS).multipliedBy(
      BigNumber.from(1).minus(SLIPPAGE),
    )

    if (maxToPay.lt(maxToSell)) {
      return maxToPay.dividedBy(maxPrice.unscaleBy(WAD_DECIMALS))
    }

    return maxToSell.dividedBy(maxPrice.unscaleBy(WAD_DECIMALS))
  }, [auctionData?.auctionedCollateral, maxPrice, FIATBalance])

  return {
    approve,
    approveMoneta,
    hasAllowance,
    hasMonetaAllowance,
    buyCollateral,
    maxPrice,
    maxCredit,
    ...txStatus,
  }
}
