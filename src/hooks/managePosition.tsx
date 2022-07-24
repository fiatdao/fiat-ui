import { usePosition } from './subgraph/usePosition'
import { useERC155Allowance } from './useERC1155Allowance'
import { useERC20Allowance } from './useERC20Allowance'
import { useTokenDecimalsAndBalance } from './useTokenDecimalsAndBalance'
import { useFIATBalance } from './useFIATBalance'
import { useUnderlyingExchangeValue } from './useUnderlyingExchangeValue'
import { usePTokenToUnderlier } from './usePTokenToUnderlier'
import { useUnderlierToFCash } from './underlierToFCash'
import {
  ENABLE_PROXY_FOR_FIAT_TEXT,
  EST_FIAT_TOOLTIP_TEXT,
  EST_HEALTH_FACTOR_TOOLTIP_TEXT,
  EXECUTE_TEXT,
  INFINITE_BIG_NUMBER,
  INSUFFICIENT_BALANCE_TEXT,
  MIN_EPSILON_OFFSET,
  ONE_BIG_NUMBER,
  SET_FIAT_ALLOWANCE_PROXY_TEXT,
  VIRTUAL_RATE_MAX_SLIPPAGE,
  WAD_DECIMALS,
  ZERO_BIG_NUMBER,
  getBorrowAmountBelowDebtFloorText,
} from '../constants/misc'
import { parseDate } from '../utils/dateTime'
import { getHealthFactorState } from '../utils/table'
import { getEtherscanAddressUrl, shortenAddr } from '../web3/utils'
import { getDecimalsFromScale } from '../constants/bondTokens'
import { contracts } from '@/src/constants/contracts'
import { getUnderlyingDataSummary } from '@/src/utils/underlyingPositionHelpers'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { useQueryParam } from '@/src/hooks/useQueryParam'
import { useUserActions } from '@/src/hooks/useUserActions'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import {
  Position,
  calculateHealthFactor,
  calculateMaxBorrow,
  isValidHealthFactor,
} from '@/src/utils/data/positions'
import { getHumanValue, getNonHumanValue, perSecondToAPR } from '@/src/web3/utils'
import {
  CollateralTabKey,
  FiatTabKey,
  PositionManageFormFields,
} from '@/pages/your-positions/[positionId]/manage'
import { DEFAULT_HEALTH_FACTOR } from '@/src/constants/healthFactor'
import { VaultType } from '@/types/subgraph/__generated__/globalTypes'
import { Collateral } from '@/src/utils/data/collaterals'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'

export type TokenInfo = {
  decimals?: number
  humanValue?: BigNumber
}

export const useManagePositionForm = (
  position: Position | undefined,
  collateral: Collateral | undefined,
  positionFormFields: PositionManageFormFields | undefined,
  activeTabKey: FiatTabKey | CollateralTabKey,
  slippageTolerance: number,
  maxTransactionTime: number,
  onSuccess?: () => void,
) => {
  const { address, appChainId, readOnlyAppProvider } = useWeb3Connection()
  const {
    approveFIAT,
    buyCollateralAndModifyDebtERC20,
    modifyCollateralAndDebt,
    redeemCollateralAndModifyDebtERC20,
    redeemCollateralAndModifyDebtERC1155,
    sellCollateralAndModifyDebtERC20,
  } = useUserActions(position?.vaultType)
  const { isProxyAvailable, loadingProxy, setupProxy, userProxyAddress } = useUserProxy()
  const [hasMonetaAllowance, setHasMonetaAllowance] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [finished, setFinished] = useState<boolean>(false)

  // max & available bond values
  const [maxDepositAmount, setMaxDepositAmount] = useState<BigNumber>(ZERO_BIG_NUMBER)
  const [availableDepositAmount, setAvailableDepositAmount] = useState<BigNumber>(ZERO_BIG_NUMBER)
  const [availableWithdrawAmount, setAvailableWithdrawAmount] = useState<BigNumber>(ZERO_BIG_NUMBER)
  const [maxWithdrawAmount, setMaxWithdrawAmount] = useState<BigNumber>(ZERO_BIG_NUMBER)

  // max & available underlier values
  const [maxUnderlierDepositAmount, setMaxUnderlierDepositAmount] =
    useState<BigNumber>(ZERO_BIG_NUMBER)
  const [availableUnderlierDepositAmount, setAvailableUnderlierDepositAmount] =
    useState<BigNumber>(ZERO_BIG_NUMBER)
  const [estimatedUnderlierToReceive, setEstimatedUnderlierToReceive] =
    useState<BigNumber>(ZERO_BIG_NUMBER)
  const [availableUnderlierWithdrawAmount, setAvailableUnderlierWithdrawAmount] =
    useState<BigNumber>(ZERO_BIG_NUMBER)

  const [maxBorrowAmount, setMaxBorrowAmount] = useState<BigNumber>(ZERO_BIG_NUMBER)
  const [maxRepayAmount, setMaxRepayAmount] = useState<BigNumber>(ZERO_BIG_NUMBER)

  const [healthFactor, setHealthFactor] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)
  const [buttonText, setButtonText] = useState<string>('Execute')
  const tokenAddress = position?.collateral.address

  const [isRepayingFIAT, setIsRepayingFIAT] = useState<boolean>(false)
  const [loadingMonetaAllowanceApprove, setLoadingMonetaAllowanceApprove] = useState<boolean>(false)

  const { tokenInfo, updateToken } = useTokenDecimalsAndBalance({
    address,
    readOnlyAppProvider,
    tokenData: {
      symbol: position?.collateral.symbol ?? '',
      address: position?.collateral.address ?? '',
      decimals: 8, // TODO: Fix me
    },
    vaultType: position?.vaultType ?? '',
    tokenId: position?.tokenId ?? '0',
  })

  const { tokenInfo: underlyingInfo, updateToken: updateUnderlying } = useTokenDecimalsAndBalance({
    address,
    readOnlyAppProvider,
    tokenData: {
      symbol: position?.underlier.symbol ?? '',
      address: position?.underlier.address ?? '',
      decimals: 8, // TODO: Fix me
    },
    tokenId: collateral?.tokenId ?? '0',
  })

  const [FIATBalance] = useFIATBalance(true) // true param requests as human value

  const erc20 = useERC20Allowance(tokenAddress ?? '', userProxyAddress ?? '')
  const erc1155 = useERC155Allowance(tokenAddress ?? '', userProxyAddress ?? '')

  const activeToken = position?.vaultType === 'NOTIONAL' ? erc1155 : erc20
  const {
    approve: approveTokenAllowance,
    hasAllowance: hasTokenAllowance,
    loadingApprove: loadingTokenAllowanceApprove,
  } = activeToken

  const calculateHealthFactorFromPosition = useCallback(
    (collateral: BigNumber, debt: BigNumber) => {
      const currentValue = position?.currentValue
      const collateralizationRatio = position?.vaultCollateralizationRatio

      const { healthFactor: newHF } = calculateHealthFactor(
        currentValue,
        collateralizationRatio,
        collateral,
        debt,
      )
      if (newHF?.isNegative()) {
        return INFINITE_BIG_NUMBER
      }
      return newHF
    },
    [position?.currentValue, position?.vaultCollateralizationRatio],
  )

  const {
    approve: approveFiatAllowance,
    hasAllowance: hasFiatAllowance,
    loadingApprove: loadingFiatAllowanceApprove,
  } = useERC20Allowance(contracts.FIAT.address[appChainId] ?? '', userProxyAddress ?? '')

  const MONETA = contracts.MONETA.address[appChainId]
  const [monetaFiatAllowance] = useContractCall(
    contracts.FIAT.address[appChainId],
    contracts.FIAT.abi,
    'allowance',
    [userProxyAddress, MONETA],
  )

  useEffect(() => {
    setHasMonetaAllowance(!!monetaFiatAllowance && monetaFiatAllowance?.gt(ZERO_BIG_NUMBER))
  }, [monetaFiatAllowance])

  const underlierDecimals = useMemo(
    () => (collateral ? getDecimalsFromScale(collateral.underlierScale) : 0),
    [collateral],
  )

  const [singleUnderlierToPToken] = useUnderlyingExchangeValue({
    vault: collateral?.vault?.address ?? '',
    balancerVault: collateral?.eptData?.balancerVault ?? '',
    curvePoolId: collateral?.eptData?.poolId ?? '',
    underlierAmount: getNonHumanValue(new BigNumber(1), underlierDecimals), //single underlier value
  })

  const [singlePTokenToUnderlier] = usePTokenToUnderlier({
    vault: collateral?.vault?.address ?? '',
    balancerVault: collateral?.eptData?.balancerVault ?? '',
    curvePoolId: collateral?.eptData?.poolId ?? '',
    pTokenAmount: getNonHumanValue(new BigNumber(1), underlierDecimals), //single underlier value
  })

  const [underlierToFCash] = useUnderlierToFCash({
    tokenId: collateral?.tokenId ?? '',
    amount: getNonHumanValue(ONE_BIG_NUMBER, underlierDecimals), // single underlier value
  })

  const marketRate = useMemo((): BigNumber => {
    return collateral?.vault.type === 'NOTIONAL'
      ? ONE_BIG_NUMBER.div(getHumanValue(underlierToFCash, 77)) // Why is this number 77? This is what I currently have to use based on what Im recieving from the contract call but this doesnt seem right
      : ONE_BIG_NUMBER.div(getHumanValue(singleUnderlierToPToken, underlierDecimals))
  }, [collateral?.vault.type, underlierDecimals, underlierToFCash, singleUnderlierToPToken])

  // If user is repaying the max FIAT debt, maxWithdraw = totalCollateral. Otherwise,
  // maxWithdraw = collateral * collateralPrice - debt * collateralizationRation * maxSlippage
  const calculateMaxWithdrawAmount = useCallback(
    (totalCollateral: BigNumber, totalDebt: BigNumber) => {
      // If repay amount is maxed out, max withdraw amount should be equal to collateral deposited so the user can close their position
      const toMint = getNonHumanValue(positionFormFields?.borrow, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
      const toRepay = getNonHumanValue(positionFormFields?.repay, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
      const deltaDebt = toMint.minus(toRepay)
      const positionDebt = position?.totalDebt ?? ZERO_BIG_NUMBER
      const newDebt = positionDebt.plus(deltaDebt) ?? ZERO_BIG_NUMBER
      const isUserMaxRepaying = newDebt.lt(MIN_EPSILON_OFFSET)
      if (isUserMaxRepaying) {
        return getHumanValue(totalCollateral, WAD_DECIMALS)
      }

      // Otherwise, max withdraw amount should have a bit of a buffer so user doesn't immediately get margin called
      const collateralizationRatio = position?.vaultCollateralizationRatio || ONE_BIG_NUMBER
      const currentValue = position?.currentValue ? position?.currentValue : BigNumber.from(1)
      const withdrawAmount = totalCollateral
        .times(currentValue)
        .minus(totalDebt.times(collateralizationRatio).times(VIRTUAL_RATE_MAX_SLIPPAGE))
      let result = ZERO_BIG_NUMBER
      if (withdrawAmount.isPositive()) {
        result = withdrawAmount
      }

      return getHumanValue(result, WAD_DECIMALS * 2)
    },
    [
      position?.vaultCollateralizationRatio,
      position?.currentValue,
      position?.totalDebt,
      positionFormFields?.borrow,
      positionFormFields?.repay,
    ],
  )

  const calculateEstimatedUnderlierToReceive = useCallback((): BigNumber => {
    if (collateral?.vault.type !== VaultType.ELEMENT) {
      return ZERO_BIG_NUMBER
    }

    const underlierWithdrawAmount = positionFormFields?.underlierWithdrawAmount ?? ZERO_BIG_NUMBER
    const estimate = singlePTokenToUnderlier
      ?.times(underlierWithdrawAmount)
      .unscaleBy(underlierDecimals)
    return estimate
  }, [
    collateral?.vault.type,
    singlePTokenToUnderlier,
    positionFormFields?.underlierWithdrawAmount,
    underlierDecimals,
  ])

  // maxBorrow = collateral * collateralPrice / ( collateralizationRatio * maxSlippage ) - currentDebt
  const calculateMaxBorrowAmount = useCallback(
    (totalCollateral: BigNumber, totalDebt: BigNumber) => {
      const collateralizationRatio = position?.vaultCollateralizationRatio || ONE_BIG_NUMBER
      const collateralValue = position?.currentValue ? position?.currentValue : ONE_BIG_NUMBER
      return calculateMaxBorrow(totalCollateral, collateralValue, collateralizationRatio, totalDebt)
    },
    [position?.vaultCollateralizationRatio, position?.currentValue],
  )

  const calculateMaxRepayAmount = useCallback((debt: BigNumber) => {
    const repayAmountWithMargin = getHumanValue(debt, WAD_DECIMALS)
    return repayAmountWithMargin
  }, [])

  const approveMonetaAllowance = useCallback(async () => {
    const MONETA = contracts.MONETA.address[appChainId]
    try {
      setLoadingMonetaAllowanceApprove(true)
      await approveFIAT(MONETA)
    } finally {
      setLoadingMonetaAllowanceApprove(false)
    }
    setHasMonetaAllowance(true)
  }, [approveFIAT, appChainId])

  const getDeltasFromForm = useCallback(() => {
    const toDeposit = getNonHumanValue(positionFormFields?.deposit, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
    // estimate deposited collateral from underlier to deposit
    const underlierToSwap =
      getNonHumanValue(
        positionFormFields?.underlierDepositAmount?.times(
          getHumanValue(singleUnderlierToPToken, underlierDecimals),
        ),
        WAD_DECIMALS,
      ) ?? ZERO_BIG_NUMBER

    const toWithdraw =
      getNonHumanValue(positionFormFields?.withdraw, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
    const underlierWithdrawAmount =
      getNonHumanValue(positionFormFields?.underlierWithdrawAmount, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
    const redeemAmount =
      getNonHumanValue(positionFormFields?.redeemAmount, WAD_DECIMALS) ?? ZERO_BIG_NUMBER

    const deltaCollateral = toDeposit
      .plus(underlierToSwap)
      .minus(toWithdraw)
      .minus(underlierWithdrawAmount)
      .minus(redeemAmount)

    const toMint = getNonHumanValue(positionFormFields?.borrow, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
    const toRepay = getNonHumanValue(positionFormFields?.repay, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
    const deltaDebt = toMint.minus(toRepay)

    return { deltaCollateral, deltaDebt }
  }, [
    positionFormFields?.underlierDepositAmount,
    positionFormFields?.underlierWithdrawAmount,
    positionFormFields?.deposit,
    positionFormFields?.withdraw,
    positionFormFields?.borrow,
    positionFormFields?.repay,
    positionFormFields?.redeemAmount,
    singleUnderlierToPToken,
    underlierDecimals,
  ])

  const getPositionValues = useCallback(() => {
    const { deltaCollateral, deltaDebt } = getDeltasFromForm()
    const positionCollateral = position?.totalCollateral ?? ZERO_BIG_NUMBER
    const positionDebt = position?.totalDebt ?? ZERO_BIG_NUMBER
    const collateral = positionCollateral.plus(deltaCollateral)
    const debt = positionDebt.plus(deltaDebt) ?? ZERO_BIG_NUMBER
    return { positionCollateral, positionDebt, collateral, debt, deltaCollateral, deltaDebt }
  }, [position?.totalCollateral, position?.totalDebt, getDeltasFromForm])

  const hasMinimumFIAT = useMemo(() => {
    // Minimum fiat to have in a position is the debtFloor
    // there are two cases where we disable the button:
    // - resulting FIAT is less than a vault's debtFloor, as required in the contracts
    // - resulting FIAT is zero or (due to BigNumber precision issues) extremely close
    //   to zero. We determine this by checking if new debt is in the range [ZERO, MIN_EPSILON_OFFSET).
    const { debt } = getPositionValues()
    const debtFloor = position?.debtFloor ?? ZERO_BIG_NUMBER
    const isNearZero = debt.lt(MIN_EPSILON_OFFSET) // or zero

    return debt.gte(debtFloor) || isNearZero
  }, [getPositionValues, position?.debtFloor])

  const isRepayingMoreThanBalance = useMemo(() => {
    const repayAmount = positionFormFields?.repay ?? ZERO_BIG_NUMBER
    return repayAmount.gt(FIATBalance.plus(MIN_EPSILON_OFFSET))
  }, [positionFormFields?.repay, FIATBalance])

  const isRepayingMoreThanMaxRepay = useMemo(() => {
    const repayAmount = positionFormFields?.repay ?? ZERO_BIG_NUMBER
    return repayAmount.gt(maxRepayAmount.plus(MIN_EPSILON_OFFSET))
  }, [positionFormFields?.repay, maxRepayAmount])

  const isBorrowingMoreThanMaxBorrow = useMemo(() => {
    const borrowAmount = positionFormFields?.borrow ?? ZERO_BIG_NUMBER
    return borrowAmount.gt(maxBorrowAmount.plus(MIN_EPSILON_OFFSET))
  }, [positionFormFields?.borrow, maxBorrowAmount])

  const isDepositingMoreThanMaxDeposit = useMemo(() => {
    const depositAmount = positionFormFields?.deposit ?? ZERO_BIG_NUMBER
    return depositAmount.gt(maxDepositAmount.plus(MIN_EPSILON_OFFSET))
  }, [positionFormFields?.deposit, maxDepositAmount])

  const isWithdrawingMoreThanMaxWithdraw = useMemo(() => {
    const withdrawAmount = positionFormFields?.withdraw ?? ZERO_BIG_NUMBER
    return withdrawAmount.gt(maxWithdrawAmount.plus(MIN_EPSILON_OFFSET))
  }, [positionFormFields?.withdraw, maxWithdrawAmount])

  const isDisabledCreatePosition = useMemo(() => {
    return (
      isLoading ||
      !hasMinimumFIAT ||
      isRepayingMoreThanMaxRepay ||
      isRepayingMoreThanBalance ||
      isBorrowingMoreThanMaxBorrow ||
      isDepositingMoreThanMaxDeposit ||
      isWithdrawingMoreThanMaxWithdraw
    )
  }, [
    isLoading,
    hasMinimumFIAT,
    isRepayingMoreThanMaxRepay,
    isRepayingMoreThanBalance,
    isBorrowingMoreThanMaxBorrow,
    isDepositingMoreThanMaxDeposit,
    isWithdrawingMoreThanMaxWithdraw,
  ])

  const updateAmounts = useCallback(() => {
    const { collateral, debt, deltaCollateral, deltaDebt, positionCollateral, positionDebt } =
      getPositionValues()

    const collateralBalance = tokenInfo?.humanValue ?? ZERO_BIG_NUMBER
    const maxWithdraw = calculateMaxWithdrawAmount(positionCollateral, debt)
    // TODO: remove these unnecessary state updates, just use collateralBalance in the component itself
    setMaxDepositAmount(collateralBalance)
    setAvailableDepositAmount(collateralBalance)
    setAvailableWithdrawAmount(collateralBalance)
    setMaxWithdrawAmount(maxWithdraw)

    const underlyingBalance = underlyingInfo?.humanValue ?? ZERO_BIG_NUMBER
    setAvailableUnderlierDepositAmount(underlyingBalance)
    setMaxUnderlierDepositAmount(underlyingBalance)
    setAvailableUnderlierWithdrawAmount(underlyingBalance)
    const estimate = calculateEstimatedUnderlierToReceive()
    setEstimatedUnderlierToReceive(estimate)

    const maxBorrow = calculateMaxBorrowAmount(collateral, positionDebt)
    const maxRepay = calculateMaxRepayAmount(positionDebt)
    const newHealthFactor = calculateHealthFactorFromPosition(collateral, debt)
    setMaxBorrowAmount(maxBorrow)
    setMaxRepayAmount(maxRepay)
    setHealthFactor(newHealthFactor)

    if (deltaDebt.isNegative()) {
      setIsRepayingFIAT(true)

      let text = EXECUTE_TEXT
      if (!hasFiatAllowance && activeTabKey === 'repay') {
        text = SET_FIAT_ALLOWANCE_PROXY_TEXT
      } else if (!hasMonetaAllowance) {
        text = ENABLE_PROXY_FOR_FIAT_TEXT
      } else if (!hasMinimumFIAT) {
        text = getBorrowAmountBelowDebtFloorText(position?.debtFloor)
      } else if (isRepayingMoreThanMaxRepay) {
        text = `Cannot repay more than ${maxRepay.toFormat(3).toString()}`
      } else if (isRepayingMoreThanBalance) {
        text = INSUFFICIENT_BALANCE_TEXT
      }
      setButtonText(text)
    } else {
      setIsRepayingFIAT(false)

      let text = EXECUTE_TEXT
      if (!hasFiatAllowance && activeTabKey === 'repay') {
        text = SET_FIAT_ALLOWANCE_PROXY_TEXT
      } else if (isBorrowingMoreThanMaxBorrow) {
        text = `Cannot borrow more than ${maxBorrow.toFormat(3).toString()}`
      }
      setButtonText(text)
    }

    if (deltaCollateral.isNegative()) {
      // is withdrawing collateral
      if (isWithdrawingMoreThanMaxWithdraw) {
        setButtonText(`Cannot withdraw more than ${maxWithdraw.toFormat(3).toString()}`)
      }
    } else {
      if (isDepositingMoreThanMaxDeposit) {
        setButtonText(INSUFFICIENT_BALANCE_TEXT)
      }
    }
  }, [
    activeTabKey,
    calculateEstimatedUnderlierToReceive,
    calculateHealthFactorFromPosition,
    calculateMaxBorrowAmount,
    calculateMaxRepayAmount,
    calculateMaxWithdrawAmount,
    getPositionValues,
    hasFiatAllowance,
    hasMinimumFIAT,
    hasMonetaAllowance,
    isBorrowingMoreThanMaxBorrow,
    isDepositingMoreThanMaxDeposit,
    isRepayingMoreThanBalance,
    isRepayingMoreThanMaxRepay,
    isWithdrawingMoreThanMaxWithdraw,
    position?.debtFloor,
    tokenInfo?.humanValue,
    underlyingInfo?.humanValue,
  ])

  const handleFormChange = () => {
    updateAmounts()
  }

  // @TODO: available -> balance
  useEffect(() => {
    updateAmounts()
  }, [updateAmounts])

  const handleManage = async ({
    borrow,
    deposit,
    redeemAmount,
    repay,
    underlierDepositAmount,
    underlierWithdrawAmount,
    withdraw,
  }: PositionManageFormFields): Promise<void> => {
    try {
      if (!position || !position.protocolAddress || !position.collateral.address) return

      const toDeposit = getNonHumanValue(deposit, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
      const toWithdraw = getNonHumanValue(withdraw, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
      const toMint = getNonHumanValue(borrow, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
      const toRepay = getNonHumanValue(repay, WAD_DECIMALS) ?? ZERO_BIG_NUMBER

      const deltaCollateral = toDeposit.minus(toWithdraw)
      const deltaDebt = toMint.minus(toRepay)

      setIsLoading(true)

      if (underlierDepositAmount !== ZERO_BIG_NUMBER && underlierDepositAmount !== undefined) {
        // If depositing underlier, call respective deposit underlier action
        if (!collateral) {
          console.error('Attempted to deposit underlier without valid collateral')
          return
        }

        const underlierDepositAmountFixedPoint = getNonHumanValue(
          underlierDepositAmount,
          underlierDecimals,
        )
        const slippageDecimal = 1 - slippageTolerance / 100
        const pTokenAmount = underlierDepositAmount.multipliedBy(
          getHumanValue(singleUnderlierToPToken, underlierDecimals),
        )
        const minOutput = getNonHumanValue(
          pTokenAmount.multipliedBy(slippageDecimal),
          underlierDecimals,
        )
        const deadline = Number((Date.now() / 1000).toFixed(0)) + maxTransactionTime * 60
        const approve = underlierDepositAmountFixedPoint.toFixed(0, 8)
        switch (position?.vaultType) {
          case VaultType.ELEMENT: {
            await buyCollateralAndModifyDebtERC20({
              vault: collateral.vault.address,
              deltaDebt,
              virtualRate: collateral.vault.virtualRate,
              underlierAmount: underlierDepositAmountFixedPoint,
              swapParams: {
                balancerVault: collateral.eptData.balancerVault,
                poolId: collateral.eptData?.poolId ?? '',
                assetIn: collateral.underlierAddress ?? '',
                assetOut: collateral.address ?? '',
                minOutput: minOutput.toFixed(0, 8),
                deadline: deadline,
                approve: approve,
              },
            })
            await updateUnderlying()
            break
          }
          case VaultType.YIELD:
          case VaultType.NOTIONAL: {
            console.error('unimplemented')
            break
          }
          default: {
            console.error('Attempted to buyCollateralAndModifyDebt for unknown vault type')
          }
        }
      } else if (
        underlierWithdrawAmount !== ZERO_BIG_NUMBER &&
        underlierWithdrawAmount !== undefined
      ) {
        if (!collateral) {
          console.error('Attempted to withdraw underlier without valid collateral')
          return
        }

        // If withdrawing underlier, call respective withdraw underlier action
        const underlierWithdrawAmountFixedPoint = getNonHumanValue(
          underlierWithdrawAmount,
          underlierDecimals,
        )
        const slippageDecimal = 1 - slippageTolerance / 100
        const pTokenAmount = underlierWithdrawAmount.multipliedBy(
          getHumanValue(singlePTokenToUnderlier, underlierDecimals),
        )
        const minOutput = getNonHumanValue(
          pTokenAmount.multipliedBy(slippageDecimal),
          underlierDecimals,
        )
        const deadline = Number((Date.now() / 1000).toFixed(0)) + maxTransactionTime * 60
        const approve = underlierWithdrawAmountFixedPoint.toFixed(0, 8)
        switch (position?.vaultType) {
          case VaultType.ELEMENT: {
            await sellCollateralAndModifyDebtERC20({
              vault: collateral.vault.address,
              deltaDebt,
              virtualRate: collateral.vault.virtualRate,
              pTokenAmount: underlierWithdrawAmountFixedPoint,
              swapParams: {
                balancerVault: collateral.eptData.balancerVault,
                poolId: collateral.eptData?.poolId ?? '',
                assetIn: collateral.address ?? '',
                assetOut: collateral.underlierAddress ?? '',
                minOutput: minOutput.toFixed(0, 8),
                deadline: deadline,
                approve: approve,
              },
            })
            await updateUnderlying()
            break
          }
          case VaultType.YIELD:
            console.error('unimplemented')
            break
          case VaultType.NOTIONAL:
            console.error('unimplemented')
            break
          default:
            console.error('Attempted to sellCollateralAndModifyDebtERC20 for unknown vault type')
        }
      } else if (redeemAmount !== ZERO_BIG_NUMBER && redeemAmount !== undefined) {
        if (!collateral) {
          console.error('Attempted to redeem underlier without valid collateral')
          return
        }

        const redeemAmountFixedPoint = getNonHumanValue(redeemAmount, underlierDecimals)
        switch (position?.vaultType) {
          case VaultType.ELEMENT: {
            await redeemCollateralAndModifyDebtERC20({
              vault: collateral.vault.address,
              token: collateral.address ?? '',
              pTokenAmount: redeemAmountFixedPoint,
              deltaDebt,
              virtualRate: collateral.vault.virtualRate,
            })
            await updateUnderlying()
            break
          }
          case VaultType.YIELD:
            console.error('unimplemented')
            break
          case VaultType.NOTIONAL:
            // fun fact, modifyCollateralAndDebt will redeem for notional,
            // but it's more idiomatic to call redeemCollateralAndModifyDebt
            console.log('redeem amount: ', redeemAmountFixedPoint.toString())
            await redeemCollateralAndModifyDebtERC1155({
              vault: collateral.vault.address,
              token: collateral.address ?? '',
              tokenId: collateral.tokenId ?? '',
              fCashAmount: redeemAmountFixedPoint,
              deltaDebt,
              virtualRate: collateral.vault.virtualRate,
            })
            await updateUnderlying()
            break
          default:
            console.error('Attempted to redeemCollateralAndModifyDebtERC20 for unknown vault type')
        }
      } else {
        await modifyCollateralAndDebt({
          vault: position?.protocolAddress,
          token: position?.collateral.address,
          tokenId: Number(position.tokenId),
          deltaCollateral,
          deltaDebt,
          wait: 3,
          virtualRate: position.virtualRate,
        })
        await updateToken()
      }

      setFinished(true)

      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Failed to Deposit:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const getFormSummaryData = () => {
    const { deltaCollateral, deltaDebt } = getDeltasFromForm()
    const newDebt = position?.totalDebt.plus(deltaDebt)

    const newCollateral = position?.totalCollateral.plus(deltaCollateral)

    const fiatDebtSummarySections = [
      {
        title: 'Current FIAT debt',
        value: getHumanValue(position?.totalDebt, WAD_DECIMALS).toFixed(2),
      },
      {
        title: 'Estimated new FIAT debt',
        titleTooltip: EST_FIAT_TOOLTIP_TEXT,
        value: getHumanValue(newDebt, WAD_DECIMALS).toFixed(2),
      },
    ]

    const healthFactorSummarySections = [
      {
        title: 'Current Health Factor',
        state: getHealthFactorState(position?.healthFactor ?? ZERO_BIG_NUMBER),
        value: isValidHealthFactor(position?.healthFactor)
          ? position?.healthFactor?.toFixed(2)
          : DEFAULT_HEALTH_FACTOR,
      },
      {
        title: 'Estimated new Health Factor',
        titleTooltip: EST_HEALTH_FACTOR_TOOLTIP_TEXT,
        state: getHealthFactorState(healthFactor ?? ZERO_BIG_NUMBER),
        value: isValidHealthFactor(healthFactor) ? healthFactor?.toFixed(2) : DEFAULT_HEALTH_FACTOR,
      },
    ]

    const bondSummary = [
      {
        title: 'Current collateral deposited',
        value: getHumanValue(position?.totalCollateral, WAD_DECIMALS).toFixed(2),
      },
      {
        title: 'New collateral deposited',
        value: getHumanValue(newCollateral, WAD_DECIMALS).toFixed(2),
      },
      ...fiatDebtSummarySections,
      ...healthFactorSummarySections,
    ]

    const underlierDepositAmount = positionFormFields?.underlierDepositAmount ?? ZERO_BIG_NUMBER
    const estimatedCollateralToDeposit = underlierDepositAmount.multipliedBy(
      getHumanValue(singleUnderlierToPToken, underlierDecimals),
    )
    const depositUnderlierSummary = collateral
      ? [
          {
            title: 'Estimated collateral to deposit',
            value: estimatedCollateralToDeposit.toFixed(2),
          },
          ...getUnderlyingDataSummary(
            marketRate,
            slippageTolerance,
            collateral,
            underlierDepositAmount.toNumber(),
          ),
          ...fiatDebtSummarySections,
          ...healthFactorSummarySections,
        ]
      : []

    const underlierWithdrawAmount = positionFormFields?.underlierWithdrawAmount ?? ZERO_BIG_NUMBER
    const withdrawUnderlierSummary = collateral
      ? [
          {
            title: 'Estimated underlier to receive',
            value: estimatedUnderlierToReceive?.toFixed(2),
          },
          {
            title: 'Current collateral deposited',
            value: getHumanValue(position?.totalCollateral, WAD_DECIMALS).toFixed(2),
          },
          ...getUnderlyingDataSummary(
            marketRate,
            slippageTolerance,
            collateral,
            underlierWithdrawAmount.toNumber(),
          ),
          ...fiatDebtSummarySections,
          ...healthFactorSummarySections,
        ]
      : []

    const underlierRedeemAmount = positionFormFields?.redeemAmount ?? ZERO_BIG_NUMBER
    const redeemSummary = collateral
      ? [
          {
            title: 'Estimated underlier to receive',
            value: underlierRedeemAmount?.toFixed(2),
          },
          {
            title: 'Current collateral deposited',
            value: getHumanValue(position?.totalCollateral, WAD_DECIMALS).toFixed(2),
          },
          ...fiatDebtSummarySections,
          ...healthFactorSummarySections,
        ]
      : []

    if (activeTabKey === 'underlierDepositAmount' || underlierDepositAmount !== ZERO_BIG_NUMBER) {
      return depositUnderlierSummary
    } else if (
      activeTabKey === 'underlierWithdrawAmount' ||
      underlierWithdrawAmount !== ZERO_BIG_NUMBER
    ) {
      return withdrawUnderlierSummary
    } else if (activeTabKey === 'redeem') {
      return redeemSummary
    } else {
      return bondSummary
    }
  }

  return {
    availableDepositAmount,
    availableUnderlierDepositAmount,
    maxDepositAmount,
    maxUnderlierDepositAmount,
    estimatedUnderlierToReceive,
    setEstimatedUnderlierToReceive,
    availableUnderlierWithdrawAmount,
    availableWithdrawAmount,
    getFormSummaryData,
    maxWithdrawAmount,
    maxRepayAmount,
    maxBorrowAmount,
    healthFactor,
    handleFormChange,
    buttonText,
    isLoading,
    handleManage,
    calculateHealthFactorFromPosition,
    isDisabledCreatePosition,
    finished,
    setFinished,
    isProxyAvailable,
    setupProxy,
    loadingProxy,
    approveTokenAllowance,
    hasTokenAllowance,
    loadingTokenAllowanceApprove,
    hasFiatAllowance,
    approveFiatAllowance,
    loadingFiatAllowanceApprove,
    hasMonetaAllowance,
    approveMonetaAllowance,
    loadingMonetaAllowanceApprove,
    isRepayingFIAT,
  }
}

export const useManagePositionsInfoBlock = (position: Position) => {
  const chainId = useWeb3Connection().appChainId
  return [
    {
      title: 'Asset',
      value: position.asset || '-',
      url: position ? getEtherscanAddressUrl(position.collateral.address, chainId) : '-',
    },
    {
      title: 'Underlying Asset',
      value: position ? position.underlier.symbol : '-',
      url: position ? getEtherscanAddressUrl(position.underlier.address, chainId) : '-',
    },
    {
      title: 'Owner',
      value: position ? shortenAddr(position.owner, 8, 8) : '-',
      url: position ? getEtherscanAddressUrl(position.owner, chainId) : '-',
    },
    {
      title: 'Maturity Date',
      tooltip: 'The date on which the bond is redeemable for its underlying assets.',
      value: position?.maturity ? parseDate(position?.maturity) : '--:--:--',
    },
    {
      title: 'Face Value',
      tooltip: 'The redeemable value of the bond at maturity.',
      value: `$${getHumanValue(position?.faceValue ?? 0, WAD_DECIMALS)?.toFixed(2)}`,
    },
    {
      title: 'Collateral Value',
      tooltip: 'The currently discounted value of the bond.',
      value: `$${getHumanValue(position?.collateralValue ?? 0, WAD_DECIMALS)?.toFixed(2)}`,
    },
    {
      title: 'Collateralization Threshold',
      tooltip: 'The minimum amount of over-collateralization required to borrow FIAT.',
      value: position?.vaultCollateralizationRatio
        ? `${getHumanValue(position?.vaultCollateralizationRatio.times(100), WAD_DECIMALS)}%`
        : '-',
    },
    {
      title: 'Interest Rate',
      tooltip: 'The annualized cost of interest for minting FIAT.',
      value: `${perSecondToAPR(getHumanValue(position?.interestPerSecond, WAD_DECIMALS)).toFixed(
        3,
      )}%`,
    },
  ]
}

export const useManagePositionInfo = () => {
  const positionId = useQueryParam('positionId')

  // const { isWalletConnected } = useWeb3Connection()
  // TODO Pass enabled: isWalletConnected && isValidPositionIdType(positionId) && isValidPositionId(positionId)

  return usePosition(positionId as string)
}
