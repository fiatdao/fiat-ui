import { usePosition } from './subgraph/usePosition'
import { useTokenDecimalsAndBalance } from './useTokenDecimalsAndBalance'
import { useERC20Allowance } from './useERC20Allowance'
import { ONE_BIG_NUMBER, WAD_DECIMALS, ZERO_BIG_NUMBER } from '../constants/misc'
import { parseDate } from '../utils/dateTime'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { contracts } from '@/src/constants/contracts'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { useFIATBalance } from '@/src/hooks/useFIATBalance'
import { useQueryParam } from '@/src/hooks/useQueryParam'
import { DepositCollateral, WithdrawCollateral, useUserActions } from '@/src/hooks/useUserActions'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Position, calculateHealthFactor } from '@/src/utils/data/positions'
import { getCurrentValue } from '@/src/utils/getCurrentValue'
import { getHumanValue, getNonHumanValue, perSecondToAPY } from '@/src/web3/utils'
import { PositionManageFormFields } from '@/pages/your-positions/[positionId]/manage'

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
  const { approveFIAT, burnFIAT, depositCollateral, modifyCollateralAndDebt } = useUserActions()
  const { userProxyAddress } = useUserProxy()
  const [hasAllowance, setHasAllowance] = useState<boolean>(false)
  const { withdrawCollateral } = useUserActions()
  const [fairPrice, setFairPrice] = useState(ZERO_BIG_NUMBER)
  const [hasMonetaAllowance, setHasMonetaAllowance] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const [maxDepositValue, setMaxDepositValue] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)
  const [maxWithdrawValue, setMaxWithdrawValue] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)
  const [maxBurnValue, setMaxBurnValue] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)
  const [maxMintValue, setMaxMintValue] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)

  const [healthFactor, setHealthFactor] = useState<BigNumber | undefined>(ZERO_BIG_NUMBER)
  const [buttonText, setButtonText] = useState<string>('Execute')

  const tokenAddress = position?.collateral.address
  const vaultAddress = position?.protocolAddress

  const { tokenInfo, updateToken } = useTokenDecimalsAndBalance({
    address,
    readOnlyAppProvider,
    tokenAddress,
  })
  const [fiatInfo, updateFiat] = useFIATBalance(true)
  const MONETA = contracts.MONETA.address[appChainId]

  const [fiatAllowance] = useContractCall(
    contracts.FIAT.address[appChainId],
    contracts.FIAT.abi,
    'allowance',
    [userProxyAddress, MONETA],
  )

  const approveToken = useCallback(async () => {
    await approveFIAT(MONETA)
    setHasAllowance(true)
  }, [approveFIAT, MONETA])

  useEffect(() => {
    setHasAllowance(!!fiatAllowance && fiatAllowance?.gt(ZERO_BIG_NUMBER))
  }, [fiatAllowance])

  const withdraw = useCallback(
    async (args: WithdrawCollateral) => {
      if (!userProxyAddress) return
      await withdrawCollateral(args)
    },
    [userProxyAddress, withdrawCollateral],
  )

  useEffect(() => {
    let isMounted = true
    getCurrentValue(readOnlyAppProvider, appChainId, 0, vaultAddress as string, false).then(
      (val) => {
        if (isMounted) setFairPrice(val)
      },
    )
    return () => {
      isMounted = false
    }
  }, [appChainId, vaultAddress, readOnlyAppProvider, setFairPrice])

  const deposit = useCallback(
    async (args: DepositCollateral) => {
      await depositCollateral(args)
      await Promise.all([updateToken(), updateFiat()])
    },
    [depositCollateral, updateToken, updateFiat],
  )

  // @TODO: component is not re-rendering after updating HF
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
    return newHF
  }

  const { approve: approveFiatAllowance, hasAllowance: hasFiatAllowance } = useERC20Allowance(
    contracts.FIAT.address[appChainId] ?? '',
    userProxyAddress ?? '',
  )

  const [monetaFiatAllowance] = useContractCall(
    contracts.FIAT.address[appChainId],
    contracts.FIAT.abi,
    'allowance',
    [userProxyAddress, MONETA],
  )

  useEffect(() => {
    setHasMonetaAllowance(!!monetaFiatAllowance && monetaFiatAllowance?.gt(ZERO_BIG_NUMBER))
  }, [monetaFiatAllowance])

  const calculateMaxWithdrawValue = useCallback(
    (totalCollateral: BigNumber, totalNormalDebt: BigNumber) => {
      return totalCollateral.minus(
        totalNormalDebt
          .times(position?.vaultCollateralizationRatio || 1)
          .div(position?.collateralValue || 1),
      )
    },
    [position?.vaultCollateralizationRatio, position?.collateralValue],
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

    const newCollateral = getHumanValue(position?.totalCollateral, WAD_DECIMALS)
      .plus(toDeposit)
      .minus(toWithdraw)

    const newFiat = getHumanValue(position?.totalNormalDebt, WAD_DECIMALS)
      .plus(toMint)
      .minus(toBurn)

    const withdrawValue = calculateMaxWithdrawValue(newCollateral, newFiat)
    const mintValue = newCollateral.div(position?.vaultCollateralizationRatio ?? ONE_BIG_NUMBER)
    const depositValue = tokenInfo?.humanValue
    const burnValue = getHumanValue(position?.totalNormalDebt, WAD_DECIMALS).plus(toMint)

    setMaxDepositValue(depositValue)
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
      const toWithdraw = withdraw ? getNonHumanValue(withdraw, WAD_DECIMALS) : ZERO_BIG_NUMBER
      const toMint = mint ? getNonHumanValue(mint, WAD_DECIMALS) : ZERO_BIG_NUMBER
      const toBurn = burn ? getNonHumanValue(burn, WAD_DECIMALS) : ZERO_BIG_NUMBER
      setIsLoading(true)
      if (!hasFiatAllowance) {
        await approveFiatAllowance()
      } else if (!hasMonetaAllowance) {
        await approveMonetaAllowance()
      } else {
        await modifyCollateralAndDebt({
          vault: position?.protocolAddress,
          token: position?.collateral.address,
          tokenId: 0,
          deltaCollateral: !toDeposit.isZero()
            ? toDeposit
            : !toWithdraw.isZero()
            ? toWithdraw.negated()
            : ZERO_BIG_NUMBER,
          deltaNormalDebt: !toMint.isZero()
            ? toMint
            : !toBurn.isZero()
            ? toBurn.negated()
            : ZERO_BIG_NUMBER,
        })
        if (onSuccess) {
          onSuccess()
        }
      }
    } catch (err) {
      console.error('Failed to Deposit', err)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    fiatInfo,
    fiatAllowance,
    updateFiat,
    burn: burnFIAT,
    tokenInfo,
    approveToken,
    hasAllowance,
    withdraw,
    fairPrice,
    deposit,
    approveMonetaAllowance,
    monetaFiatAllowance,
    approveFiatAllowance,
    hasFiatAllowance,
    maxDepositValue,
    maxWithdrawValue,
    maxBurnValue,
    maxMintValue,
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
  return [
    {
      title: 'Bond Name',
      value: position ? position.collateral.symbol : '-',
    },
    {
      title: 'Underlying',
      value: position ? position.underlier.symbol : '-',
    },
    {
      title: 'Bond Maturity',
      tooltip: 'The date on which the bond is redeemable for its underlying assets.',
      value: position?.maturity ? parseDate(position?.maturity) : '-',
    },
    {
      title: 'Bond Face Value',
      tooltip: 'The redeemable value of the bond at maturity.',
      value: `$${getHumanValue(position?.faceValue ?? 0, WAD_DECIMALS)?.toFixed(3)}`,
    },
    {
      title: 'Bond Collateral Value',
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
      value: `${perSecondToAPY(getHumanValue(position?.interestPerSecond ?? 0)).toFixed(3)}%`,
    },
  ]
}

export const useManagePositionInfo = () => {
  const positionId = useQueryParam('positionId')

  // const { isWalletConnected } = useWeb3Connection()
  // TODO Pass enabled: isWalletConnected && isValidPositionIdType(positionId) && isValidPositionId(positionId)

  return usePosition(positionId as string)
}
