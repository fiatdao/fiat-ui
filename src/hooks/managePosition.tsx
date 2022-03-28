import { usePosition } from './subgraph/usePosition'
import { useTokenDecimalsAndBalance } from './useTokenDecimalsAndBalance'
import { useERC20Allowance } from './useERC20Allowance'
import {
  INFINITE_BIG_NUMBER,
  ONE_BIG_NUMBER,
  WAD_DECIMALS,
  ZERO_BIG_NUMBER,
} from '../constants/misc'
import { parseDate } from '../utils/dateTime'
import { shortenAddr } from '../web3/utils'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { contracts } from '@/src/constants/contracts'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { useQueryParam } from '@/src/hooks/useQueryParam'
import { useUserActions } from '@/src/hooks/useUserActions'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Position, calculateDebt, calculateHealthFactor } from '@/src/utils/data/positions'
import { getHumanValue, getNonHumanValue, perSecondToAPR } from '@/src/web3/utils'
import { PositionManageFormFields } from '@/pages/your-positions/[positionId]/manage'
import { getTokenByAddress } from '@/src/constants/bondTokens'
import { DEFAULT_HEALTH_FACTOR } from '@/src/constants/healthFactor'

export type TokenInfo = {
  decimals?: number
  humanValue?: BigNumber
}

export const useManagePositionForm = (
  position: Position | undefined,
  positionFormFields: PositionManageFormFields | undefined,
  onSuccess: (() => void) | undefined,
) => {
  const { address, appChainId, readOnlyAppProvider } = useWeb3Connection()
  const { approveFIAT, modifyCollateralAndDebt } = useUserActions()
  const { userProxyAddress } = useUserProxy()
  const [hasMonetaAllowance, setHasMonetaAllowance] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [maxDepositValue, setMaxDepositValue] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)
  const [availableDepositValue, setAvailableDepositValue] = useState<BigNumber | undefined>(
    ZERO_BIG_NUMBER,
  )
  const [maxWithdrawValue, setMaxWithdrawValue] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)
  const [availableWithdrawValue, setAvailableWithdrawValue] = useState<BigNumber | undefined>(
    ZERO_BIG_NUMBER,
  )
  const [maxMintValue, setMaxMintValue] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)
  const [maxBurnValue, setMaxBurnValue] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)

  const [healthFactor, setHealthFactor] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)
  const [buttonText, setButtonText] = useState<string>('Execute')
  const tokenAddress = position?.collateral.address

  const { tokenInfo, updateToken } = useTokenDecimalsAndBalance({
    address,
    readOnlyAppProvider,
    tokenAddress,
  })

  const calculateHealthFactorFromPosition = useCallback(
    (collateral: BigNumber, normalDebt: BigNumber) => {
      const currentValue = position?.currentValue
      const collateralizationRatio = position?.vaultCollateralizationRatio

      const { healthFactor: newHF } = calculateHealthFactor(
        currentValue,
        collateralizationRatio,
        collateral,
        normalDebt,
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
  const calculateMaxWithdrawValue = useCallback(
    (totalCollateral: BigNumber, totalNormalDebt: BigNumber) => {
      const collateralizationRatio = position?.vaultCollateralizationRatio || ONE_BIG_NUMBER
      const currentValue = position?.currentValue ? position?.currentValue : 1

      const debt = calculateDebt(totalNormalDebt)
      const withdrawValue = totalCollateral.minus(
        collateralizationRatio.times(debt).div(currentValue),
      )
      let result = ZERO_BIG_NUMBER
      if (withdrawValue.isPositive()) {
        result = withdrawValue
      }
      return getHumanValue(result, WAD_DECIMALS)
    },
    [position?.vaultCollateralizationRatio, position?.currentValue],
  )
  // @TODO: not working max amount
  // maxFIAT = totalCollateral*collateralValue/collateralizationRatio-totalFIAT =
  const calculateMaxMintValue = useCallback(
    (totalCollateral: BigNumber, totalNormalDebt: BigNumber) => {
      const collateralizationRatio = position?.vaultCollateralizationRatio || ONE_BIG_NUMBER
      const currentValue = position?.currentValue ? position?.currentValue : 1
      const debt = calculateDebt(totalNormalDebt)
      const minValue = totalCollateral.times(currentValue).div(collateralizationRatio).minus(debt)
      let result = ZERO_BIG_NUMBER
      if (minValue.isPositive()) {
        result = minValue
      }
      return getHumanValue(result, WAD_DECIMALS)
    },
    [position?.vaultCollateralizationRatio, position?.currentValue],
  )
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
    const deltaNormalDebt = toMint.minus(toBurn)

    return { deltaCollateral, deltaNormalDebt }
  }, [
    positionFormFields?.deposit,
    positionFormFields?.withdraw,
    positionFormFields?.mint,
    positionFormFields?.burn,
  ])

  const getPositionValues = useCallback(() => {
    const { deltaCollateral, deltaNormalDebt } = getDeltasFromForm()
    const collateral = position?.totalCollateral.plus(deltaCollateral) ?? ZERO_BIG_NUMBER
    const normalDebt = position?.totalNormalDebt.plus(deltaNormalDebt) ?? ZERO_BIG_NUMBER
    return { collateral, normalDebt, deltaCollateral, deltaNormalDebt }
  }, [position?.totalCollateral, position?.totalNormalDebt, getDeltasFromForm])

  const handleFormChange = () => {
    if (!position?.totalCollateral || !position?.totalNormalDebt) return
    const { collateral, deltaNormalDebt, normalDebt } = getPositionValues()
    const depositValue = tokenInfo?.humanValue
    const withdrawValue = calculateMaxWithdrawValue(position?.totalCollateral, normalDebt)
    const mintValue = calculateMaxMintValue(collateral, position?.totalNormalDebt)
    const burnValue = getHumanValue(position?.totalNormalDebt, WAD_DECIMALS)

    setMaxDepositValue(depositValue)
    setMaxWithdrawValue(withdrawValue)
    setMaxMintValue(mintValue)
    setMaxBurnValue(burnValue)
    const newHealthFactor = calculateHealthFactorFromPosition(collateral, normalDebt)

    setHealthFactor(newHealthFactor)
    if (deltaNormalDebt.isNegative()) {
      const text = !hasFiatAllowance
        ? 'Set allowance for Proxy'
        : !hasMonetaAllowance
        ? 'Enable Proxy for FIAT'
        : 'Execute'
      setButtonText(text)
    } else {
      setButtonText('Execute')
    }
  }

  // @TODO: available -> balance
  useEffect(() => {
    const collateralBalance = tokenInfo?.humanValue
    const totalCollateral = position?.totalCollateral ?? ZERO_BIG_NUMBER
    const normalDebt = position?.totalNormalDebt ?? ZERO_BIG_NUMBER
    const withdrawValue = calculateMaxWithdrawValue(totalCollateral, normalDebt)
    const mintValue = calculateMaxMintValue(totalCollateral, normalDebt)
    const burnValue = getHumanValue(position?.totalNormalDebt, WAD_DECIMALS)

    setMaxDepositValue(collateralBalance)
    setMaxWithdrawValue(withdrawValue)
    setMaxMintValue(mintValue)
    setMaxBurnValue(burnValue)
    setAvailableDepositValue(collateralBalance)
    setAvailableWithdrawValue(collateralBalance)
  }, [
    tokenInfo?.humanValue,
    position?.totalCollateral,
    position?.totalNormalDebt,
    calculateMaxWithdrawValue,
    calculateMaxMintValue,
  ])

  useEffect(() => {
    const args = positionFormFields as PositionManageFormFields
    const { burn } = args
    const toBurn = burn ? burn : ZERO_BIG_NUMBER

    if (toBurn.isGreaterThan(ZERO_BIG_NUMBER)) {
      const text = !hasFiatAllowance
        ? 'Set allowance for Proxy'
        : !hasMonetaAllowance
        ? 'Enable Proxy for FIAT'
        : 'Execute'
      setButtonText(text)
    } else {
      setButtonText('Execute')
    }
  }, [hasFiatAllowance, hasMonetaAllowance, positionFormFields])

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
      const deltaNormalDebt = toMint.minus(toBurn)

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
        deltaNormalDebt,
        wait: 3,
      })

      await updateToken()

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
    availableDepositValue,
    maxDepositValue,
    availableWithdrawValue,
    maxWithdrawValue,
    maxBurnValue,
    maxMintValue,
    healthFactor,
    handleFormChange,
    buttonText,
    isLoading,
    handleManage,
    calculateHealthFactorFromPosition,
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
  const deltaNormalDebt = toMint.minus(toBurn)

  const newCollateral = position.totalCollateral.plus(deltaCollateral)
  const newFiat = position.totalNormalDebt.plus(deltaNormalDebt)
  const { healthFactor } = calculateHealthFactor(
    position.currentValue,
    position.vaultCollateralizationRatio,
    newCollateral,
    newFiat,
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
      value: getHumanValue(position.totalNormalDebt, WAD_DECIMALS).toFixed(3),
    },
    {
      title: 'New FIAT debt',
      value: getHumanValue(newFiat, WAD_DECIMALS).toFixed(3),
    },
    {
      title: 'Current Health Factor',
      value: position.healthFactor.isFinite() ? healthFactor?.toFixed(3) : DEFAULT_HEALTH_FACTOR,
    },
    {
      title: 'New Health Factor',
      value: healthFactor.isFinite() ? healthFactor?.toFixed(3) : DEFAULT_HEALTH_FACTOR,
    },
  ]
}

export const useManagePositionsInfoBlock = (position: Position) => {
  const tokenSymbol = getTokenByAddress(position?.collateral.address)?.symbol ?? ''
  return [
    {
      title: 'Token',
      value: position ? tokenSymbol : '-',
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
      title: 'Price',
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
