import { usePosition } from './subgraph/usePosition'
import { useTokenDecimalsAndBalance } from './useTokenDecimalsAndBalance'
import { useERC20Allowance } from './useERC20Allowance'
import {
  BELOW_MINIMUM_AMOUNT_TEXT,
  ENABLE_PROXY_FOR_FIAT_TEXT,
  EXECUTE_TEXT,
  INFINITE_BIG_NUMBER,
  MIN_EPSILON_OFFSET,
  ONE_BIG_NUMBER,
  SET_ALLOWANCE_PROXY_TEXT,
  WAD_DECIMALS,
  ZERO_BIG_NUMBER,
} from '../constants/misc'
import { parseDate } from '../utils/dateTime'
import { shortenAddr } from '../web3/utils'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { contracts } from '@/src/constants/contracts'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { useQueryParam } from '@/src/hooks/useQueryParam'
import { useUserActions } from '@/src/hooks/useUserActions'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Position, calculateHealthFactor, isValidHealthFactor } from '@/src/utils/data/positions'
import { getHumanValue, getNonHumanValue, perSecondToAPR } from '@/src/web3/utils'
import { PositionManageFormFields } from '@/pages/your-positions/[positionId]/manage'
import { DEFAULT_HEALTH_FACTOR } from '@/src/constants/healthFactor'

export type TokenInfo = {
  decimals?: number
  humanValue?: BigNumber
}

export const useManagePositionForm = (
  position: Position | undefined,
  positionFormFields: PositionManageFormFields | undefined,
  onSuccess?: () => void,
) => {
  const { address, appChainId, readOnlyAppProvider } = useWeb3Connection()
  const { approveFIAT, modifyCollateralAndDebt } = useUserActions()
  const { userProxyAddress } = useUserProxy()
  const [hasMonetaAllowance, setHasMonetaAllowance] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [finished, setFinished] = useState<boolean>(false)

  const [maxDepositAmount, setMaxDepositAmount] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)
  const [availableDepositAmount, setAvailableDepositAmount] = useState<BigNumber | undefined>(
    ZERO_BIG_NUMBER,
  )
  const [maxWithdrawAmount, setMaxWithdrawAmount] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)
  const [availableWithdrawAmount, setAvailableWithdrawAmount] = useState<BigNumber | undefined>(
    ZERO_BIG_NUMBER,
  )
  const [maxBorrowAmount, setMaxBorrowAmount] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)
  const [maxRepayAmount, setMaxRepayAmount] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)

  const [healthFactor, setHealthFactor] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)
  const [buttonText, setButtonText] = useState<string>('Execute')
  const tokenAddress = position?.collateral.address

  const { tokenInfo, updateToken } = useTokenDecimalsAndBalance({
    address,
    readOnlyAppProvider,
    tokenAddress,
  })

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

  const { approve: approveFiatAllowance, hasAllowance: hasFiatAllowance } = useERC20Allowance(
    contracts.FIAT.address[appChainId] ?? '',
    userProxyAddress ?? '',
  )

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

  // maxWithdraw = totalCollateral-collateralizationRatio*totalFIAT/collateralValue
  const calculateMaxWithdrawAmount = useCallback(
    (totalCollateral: BigNumber, totalDebt: BigNumber) => {
      const collateralizationRatio = position?.vaultCollateralizationRatio || ONE_BIG_NUMBER
      const currentValue = position?.currentValue ? position?.currentValue : 1

      const withdrawAmount = totalCollateral.minus(
        collateralizationRatio.times(totalDebt).div(currentValue),
      )
      let result = ZERO_BIG_NUMBER
      if (withdrawAmount.isPositive()) {
        result = withdrawAmount
      }
      return getHumanValue(result, WAD_DECIMALS)
    },
    [position?.vaultCollateralizationRatio, position?.currentValue],
  )
  // @TODO: not working max amount
  // debt = normalDebt*virtualRate
  // maxFIAT = totalCollateral*collateralValue/collateralizationRatio/(virtualRateSafetyMargin*virtualRate)-debt
  const calculateMaxBorrowAmount = useCallback(
    (totalCollateral: BigNumber, totalDebt: BigNumber) => {
      const collateralizationRatio = position?.vaultCollateralizationRatio || ONE_BIG_NUMBER
      const currentValue = position?.currentValue ? position?.currentValue : 1
      const collateralWithMults = totalCollateral.times(currentValue).div(collateralizationRatio)
      const borrowAmount = collateralWithMults.minus(totalDebt)

      let result = ZERO_BIG_NUMBER
      if (borrowAmount.isPositive()) {
        result = borrowAmount
      }
      return getHumanValue(result, WAD_DECIMALS)
    },
    [position?.vaultCollateralizationRatio, position?.currentValue],
  )

  const calculateMaxRepayAmount = useCallback((debt: BigNumber) => {
    const repayAmountWithMargin = getHumanValue(debt, WAD_DECIMALS)
    return repayAmountWithMargin
  }, [])

  const approveMonetaAllowance = useCallback(async () => {
    const MONETA = contracts.MONETA.address[appChainId]
    await approveFIAT(MONETA)
    setHasMonetaAllowance(true)
  }, [approveFIAT, appChainId])

  const getDeltasFromForm = useCallback(() => {
    const toDeposit = getNonHumanValue(positionFormFields?.deposit, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
    const toWithdraw =
      getNonHumanValue(positionFormFields?.withdraw, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
    const toMint = getNonHumanValue(positionFormFields?.mint, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
    const toBurn = getNonHumanValue(positionFormFields?.burn, WAD_DECIMALS) ?? ZERO_BIG_NUMBER

    const deltaCollateral = toDeposit.minus(toWithdraw)
    const deltaDebt = toMint.minus(toBurn)

    return { deltaCollateral, deltaDebt }
  }, [
    positionFormFields?.deposit,
    positionFormFields?.withdraw,
    positionFormFields?.mint,
    positionFormFields?.burn,
  ])

  const getPositionValues = useCallback(() => {
    const { deltaCollateral, deltaDebt } = getDeltasFromForm()
    const positionCollateral = position?.totalCollateral ?? ZERO_BIG_NUMBER
    const positionDebt = position?.totalDebt ?? ZERO_BIG_NUMBER
    const collateral = positionCollateral.plus(deltaCollateral)
    const debt = positionDebt.plus(deltaDebt) ?? ZERO_BIG_NUMBER
    return { positionCollateral, positionDebt, collateral, debt, deltaCollateral, deltaDebt }
  }, [position?.totalCollateral, position?.totalDebt, getDeltasFromForm])

  // @TODO: ui should show that the minimum fiat to have in a position is the debtFloor
  // there two cases where we don't disable the button
  // - resulting FIAT is greater than debtFloor, as required in the contracts
  // - resulting FIAT is zero or near than zero (currently there are some precision issues so
  //   we are using the range, [ZERO, MIN_EPSILON_OFFSET]. eg: when all FIAT is burned
  const hasMinimumFIAT = useMemo(() => {
    const { debt } = getPositionValues()
    const debtFloor = position?.debtFloor ?? ZERO_BIG_NUMBER
    const isNearZero = debt.lt(MIN_EPSILON_OFFSET) // or zero

    return debt.gte(debtFloor) || isNearZero
  }, [getPositionValues, position?.debtFloor])

  const isDisabledCreatePosition = useMemo(() => {
    return isLoading || !hasMinimumFIAT
  }, [isLoading, hasMinimumFIAT])

  const updateAmounts = useCallback(() => {
    const { collateral, debt, deltaDebt, positionCollateral, positionDebt } = getPositionValues()

    const collateralBalance = tokenInfo?.humanValue
    const withdrawAmount = calculateMaxWithdrawAmount(positionCollateral, debt)
    const borrowAmount = calculateMaxBorrowAmount(collateral, positionDebt)
    const repayAmount = calculateMaxRepayAmount(positionDebt)

    const newHealthFactor = calculateHealthFactorFromPosition(collateral, debt)

    setMaxDepositAmount(collateralBalance)
    setMaxWithdrawAmount(withdrawAmount)
    setMaxBorrowAmount(borrowAmount)
    setMaxRepayAmount(repayAmount)
    setHealthFactor(newHealthFactor)
    setAvailableDepositAmount(collateralBalance)
    setAvailableWithdrawAmount(collateralBalance)

    if (deltaDebt.isNegative()) {
      const text = !hasFiatAllowance
        ? SET_ALLOWANCE_PROXY_TEXT
        : !hasMonetaAllowance
        ? ENABLE_PROXY_FOR_FIAT_TEXT
        : !hasMinimumFIAT
        ? BELOW_MINIMUM_AMOUNT_TEXT
        : EXECUTE_TEXT
      setButtonText(text)
    } else {
      setButtonText(!hasMinimumFIAT ? BELOW_MINIMUM_AMOUNT_TEXT : EXECUTE_TEXT)
    }
  }, [
    getPositionValues,
    tokenInfo?.humanValue,
    calculateHealthFactorFromPosition,
    calculateMaxWithdrawAmount,
    calculateMaxBorrowAmount,
    calculateMaxRepayAmount,
    hasMinimumFIAT,
    hasFiatAllowance,
    hasMonetaAllowance,
  ])

  const handleFormChange = () => {
    updateAmounts()
  }

  // @TODO: available -> balance
  useEffect(() => {
    updateAmounts()
  }, [updateAmounts])

  const handleManage = async ({
    burn,
    deposit,
    mint,
    withdraw,
  }: PositionManageFormFields): Promise<void> => {
    try {
      if (!position || !position.protocolAddress || !position.collateral.address) return

      const toDeposit = getNonHumanValue(deposit, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
      const toWithdraw = getNonHumanValue(withdraw, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
      const toMint = getNonHumanValue(mint, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
      const toBurn = getNonHumanValue(burn, WAD_DECIMALS) ?? ZERO_BIG_NUMBER

      const deltaCollateral = toDeposit.minus(toWithdraw)
      const deltaDebt = toMint.minus(toBurn)

      setIsLoading(true)
      if (!toBurn.isZero()) {
        if (!hasFiatAllowance) {
          await approveFiatAllowance()
          setIsLoading(false)
          return
        } else if (!hasMonetaAllowance) {
          await approveMonetaAllowance()
          setIsLoading(false)
          return
        }
      }

      await modifyCollateralAndDebt({
        vault: position?.protocolAddress,
        token: position?.collateral.address,
        tokenId: 0,
        deltaCollateral,
        deltaDebt,
        wait: 3,
        virtualRate: position.virtualRate,
      })

      await updateToken()
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

  return {
    availableDepositAmount,
    maxDepositAmount,
    availableWithdrawAmount,
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
  }
}

export const useManageFormSummary = (
  position: Position,
  {
    deposit = ZERO_BIG_NUMBER,
    withdraw = ZERO_BIG_NUMBER,
    mint = ZERO_BIG_NUMBER,
    burn = ZERO_BIG_NUMBER,
  }: PositionManageFormFields,
) => {
  const toDeposit = getNonHumanValue(deposit, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
  const toWithdraw = getNonHumanValue(withdraw, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
  const toMint = getNonHumanValue(mint, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
  const toBurn = getNonHumanValue(burn, WAD_DECIMALS) ?? ZERO_BIG_NUMBER

  const deltaCollateral = toDeposit.minus(toWithdraw)
  const deltaDebt = toMint.minus(toBurn)

  const newCollateral = position.totalCollateral.plus(deltaCollateral)
  const newDebt = position.totalDebt.plus(deltaDebt)
  const { healthFactor } = calculateHealthFactor(
    position.currentValue,
    position.vaultCollateralizationRatio,
    newCollateral,
    newDebt,
  )

  return [
    {
      title: 'Current collateral deposited',
      value: getHumanValue(position.totalCollateral, WAD_DECIMALS).toFixed(3),
    },
    {
      title: 'New collateral deposited',
      value: getHumanValue(newCollateral, WAD_DECIMALS).toFixed(3),
    },
    {
      title: 'Current FIAT debt',
      value: getHumanValue(position.totalDebt, WAD_DECIMALS).toFixed(3),
    },
    {
      title: 'New FIAT debt',
      value: getHumanValue(newDebt, WAD_DECIMALS).toFixed(3),
    },
    {
      title: 'Current Health Factor',
      value: isValidHealthFactor(position.healthFactor)
        ? position.healthFactor?.toFixed(3)
        : DEFAULT_HEALTH_FACTOR,
    },
    {
      title: 'New Health Factor',
      value: isValidHealthFactor(healthFactor) ? healthFactor?.toFixed(3) : DEFAULT_HEALTH_FACTOR,
    },
  ]
}

export const useManagePositionsInfoBlock = (position: Position) => {
  return [
    {
      title: 'Asset',
      value: position.symbol || '-',
      address: position ? position.collateral.address : '-',
      appChainId: useWeb3Connection().appChainId,
    },
    {
      title: 'Underlying Asset',
      value: position ? position.underlier.symbol : '-',
      address: position ? position.underlier.address : '-',
      appChainId: useWeb3Connection().appChainId,
    },
    {
      title: 'Owner',
      value: position ? shortenAddr(position.owner, 8, 8) : '-',
      address: position ? position.owner : '-',
      appChainId: useWeb3Connection().appChainId,
    },
    {
      title: 'Maturity Date',
      tooltip: 'The date on which the bond is redeemable for its underlying assets.',
      value: position?.maturity ? parseDate(position?.maturity) : '-',
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
      tooltip: 'The minimum amount of over-collateralization required to mint FIAT.',
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
