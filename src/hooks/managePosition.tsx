import { usePosition } from './subgraph/usePosition'
import { useTokenDecimalsAndBalance } from './useTokenDecimalsAndBalance'
import { useERC20Allowance } from './useERC20Allowance'
import {
  INFINITE_BIG_NUMBER,
  ONE_BIG_NUMBER,
  VIRTUAL_RATE,
  WAD_DECIMALS,
  ZERO_BIG_NUMBER,
} from '../constants/misc'
import { parseDate } from '../utils/dateTime'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { contracts } from '@/src/constants/contracts'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { useQueryParam } from '@/src/hooks/useQueryParam'
import { useUserActions } from '@/src/hooks/useUserActions'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Position, calculateHealthFactor } from '@/src/utils/data/positions'
import { getHumanValue, getNonHumanValue, perSecondToAPY } from '@/src/web3/utils'
import { PositionManageFormFields } from '@/pages/your-positions/[positionId]/manage'
import { getTokenByAddress } from '@/src/constants/bondTokens'

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
  const [availableMintValue, setAvailableMintValue] = useState<BigNumber | undefined>(
    ZERO_BIG_NUMBER,
  )
  const [maxBurnValue, setMaxBurnValue] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)
  const [availableBurnValue, setAvailableBurnValue] = useState<BigNumber | undefined>(
    ZERO_BIG_NUMBER,
  )

  const [healthFactor, setHealthFactor] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)
  const [buttonText, setButtonText] = useState<string>('Execute')
  const tokenAddress = position?.collateral.address

  const { tokenInfo, updateToken } = useTokenDecimalsAndBalance({
    address,
    readOnlyAppProvider,
    tokenAddress,
  })

  const calculateHF = (deltaCollateral: BigNumber, deltaFiat: BigNumber) => {
    let newCollateral = getHumanValue(position?.totalCollateral, WAD_DECIMALS)
    let newFiat = getHumanValue(position?.totalNormalDebt, WAD_DECIMALS)
    const currentValue = position?.currentValue
    const collateralizationRatio = position?.vaultCollateralizationRatio as BigNumber
    if (deltaCollateral) {
      newCollateral = newCollateral.plus(deltaCollateral)
    }
    if (deltaFiat) {
      newFiat = newFiat?.plus(deltaFiat)
    }
    const { healthFactor: newHF } = calculateHealthFactor(
      currentValue,
      newCollateral,
      newFiat,
      collateralizationRatio,
    )
    if (newHF?.isNegative()) {
      return INFINITE_BIG_NUMBER
    }
    return newHF
  }

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
      const currentValue = position?.currentValue
        ? getHumanValue(position?.currentValue, WAD_DECIMALS)
        : 1

      const normalDebt = totalNormalDebt.times(VIRTUAL_RATE)
      const withdrawValue = totalCollateral.minus(
        collateralizationRatio.times(normalDebt).div(currentValue),
      )
      if (withdrawValue.isNegative()) {
        return ZERO_BIG_NUMBER
      }
      return withdrawValue
    },
    [position?.vaultCollateralizationRatio, position?.currentValue],
  )
  // maxFIAT = totalCollateral*collateralValue/collateralizationRatio-totalFIAT =
  const calculateMaxMintValue = useCallback(
    (totalCollateral: BigNumber, totalNormalDebt: BigNumber) => {
      const collateralizationRatio = position?.vaultCollateralizationRatio || ONE_BIG_NUMBER
      const currentValue = position?.currentValue
        ? getHumanValue(position?.currentValue, WAD_DECIMALS)
        : 1
      const normalDebt = totalNormalDebt.times(VIRTUAL_RATE)
      const minValue = totalCollateral
        .times(currentValue)
        .div(collateralizationRatio)
        .minus(normalDebt)
      if (minValue.isNegative()) {
        return ZERO_BIG_NUMBER
      }
      return minValue
    },
    [position?.vaultCollateralizationRatio, position?.currentValue],
  )
  const approveMonetaAllowance = useCallback(async () => {
    const MONETA = contracts.MONETA.address[appChainId]
    await approveFIAT(MONETA)
    setHasMonetaAllowance(true)
  }, [approveFIAT, appChainId])

  const handleFormChange = () => {
    const args = positionFormFields as PositionManageFormFields
    if (!position?.totalCollateral || !position.totalNormalDebt) return
    const { burn, deposit, mint, withdraw } = args

    const toDeposit = deposit ? deposit : ZERO_BIG_NUMBER
    const toWithdraw = withdraw ? withdraw : ZERO_BIG_NUMBER
    const toMint = mint ? mint : ZERO_BIG_NUMBER
    const toBurn = burn ? burn : ZERO_BIG_NUMBER

    const totalCollateral = getHumanValue(position?.totalCollateral, WAD_DECIMALS)
    const newCollateral = totalCollateral.plus(toDeposit).minus(toWithdraw)

    const totalNormalDebt = getHumanValue(position?.totalNormalDebt, WAD_DECIMALS)
    const newFiat = totalNormalDebt.plus(toMint).minus(toBurn)

    const withdrawValue = calculateMaxWithdrawValue(totalCollateral, newFiat)
    const mintValue = calculateMaxMintValue(newCollateral, totalNormalDebt)
    const burnValue = getHumanValue(position?.totalNormalDebt, WAD_DECIMALS)

    setMaxDepositValue(tokenInfo?.humanValue)
    setMaxWithdrawValue(withdrawValue)
    setMaxMintValue(mintValue)
    setMaxBurnValue(burnValue)

    setHealthFactor(calculateHF(toDeposit.minus(toWithdraw), toMint.minus(toBurn)))
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
  }

  useEffect(() => {
    const totalCollateral = getHumanValue(position?.totalCollateral, WAD_DECIMALS)
    const totalNormalDebt = getHumanValue(position?.totalNormalDebt, WAD_DECIMALS)
    const withdrawValue = calculateMaxWithdrawValue(totalCollateral, totalNormalDebt)
    const mintValue = calculateMaxMintValue(totalCollateral, totalNormalDebt)

    setAvailableDepositValue(tokenInfo?.humanValue)
    setAvailableWithdrawValue(withdrawValue)
    setAvailableBurnValue(totalNormalDebt)
    setAvailableMintValue(mintValue)
  }, [
    position?.totalCollateral,
    position?.totalNormalDebt,
    tokenInfo?.humanValue,
    position?.currentValue,
    position?.vaultCollateralizationRatio,
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

      const toDeposit = deposit ? getNonHumanValue(deposit, WAD_DECIMALS) : ZERO_BIG_NUMBER
      const toWithdraw = (
        withdraw ? getNonHumanValue(withdraw, WAD_DECIMALS) : ZERO_BIG_NUMBER
      ).negated()
      const toMint = mint ? getNonHumanValue(mint, WAD_DECIMALS) : ZERO_BIG_NUMBER
      const toBurn = (burn ? getNonHumanValue(burn, WAD_DECIMALS) : ZERO_BIG_NUMBER).negated()

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
        deltaCollateral: !toDeposit.isZero()
          ? toDeposit
          : !toWithdraw.isZero()
          ? toWithdraw
          : ZERO_BIG_NUMBER,
        deltaNormalDebt: !toMint.isZero() ? toMint : !toBurn.isZero() ? toBurn : ZERO_BIG_NUMBER,
      })
      await updateToken()
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      console.error('Failed to Deposit', err)
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
    availableBurnValue,
    maxMintValue,
    availableMintValue,
    healthFactor,
    handleFormChange,
    buttonText,
    isLoading,
    handleManage,
    calculateHF,
  }
}

export const useManageFormSummary = (
  position: Position,
  {
    burn = ZERO_BIG_NUMBER,
    withdraw = ZERO_BIG_NUMBER,
    deposit = ZERO_BIG_NUMBER,
    mint = ZERO_BIG_NUMBER,
  }: PositionManageFormFields,
) => {
  const newCollateral = getHumanValue(position.totalCollateral, WAD_DECIMALS)
    .plus(deposit)
    .minus(withdraw)
  const newFiat = getHumanValue(position.totalNormalDebt, WAD_DECIMALS)
    .plus(mint)
    .plus(burn.negated())
  const { healthFactor } = calculateHealthFactor(
    position.currentValue,
    newCollateral,
    newFiat,
    position?.vaultCollateralizationRatio as BigNumber,
  )

  return [
    {
      title: 'Current collateral deposited',
      value: getHumanValue(position.totalCollateral, WAD_DECIMALS).toFixed(3),
    },
    {
      title: 'New collateral deposited',
      value: newCollateral.toFixed(3),
    },
    {
      title: 'Current FIAT debt',
      value: getHumanValue(position.totalNormalDebt, WAD_DECIMALS).toFixed(3),
    },
    {
      title: 'New FIAT debt',
      value: newFiat.toFixed(3),
    },
    {
      title: 'Current Health Factor',
      value: getHumanValue(position.healthFactor, WAD_DECIMALS).toFixed(3),
    },
    {
      title: 'New Health Factor',
      value: getHumanValue(healthFactor, WAD_DECIMALS).toFixed(3),
    },
  ]
}

export const useManagePositionsInfoBlock = (position: Position) => {
  const tokenSymbol = getTokenByAddress(position?.collateral.address ?? null)?.symbol ?? ''
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
      title: 'Maturity Date',
      tooltip: 'The date on which the bond is redeemable for its underlying assets.',
      value: position?.maturity ? parseDate(position?.maturity) : '-',
    },
    {
      title: 'Face Value',
      tooltip: 'The redeemable value of the bond at maturity.',
      value: `$${getHumanValue(position?.faceValue ?? 0, WAD_DECIMALS)?.toFixed(3)}`,
    },
    {
      title: 'Price',
      tooltip: 'The currently discounted value of the bond.',
      value: `$${getHumanValue(position?.collateralValue ?? 0, WAD_DECIMALS)?.toFixed(3)}`,
    },
    {
      title: 'Collateralization Ratio',
      tooltip: 'The minimum amount of over-collateralization required to mint FIAT.',
      value: position?.vaultCollateralizationRatio?.toFixed() ?? '-',
    },
    {
      title: 'Interest Rate',
      tooltip: 'The annualized cost of interest for minting FIAT.',
      value: `${perSecondToAPY(getHumanValue(position?.interestPerSecond, WAD_DECIMALS)).toFixed(
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
