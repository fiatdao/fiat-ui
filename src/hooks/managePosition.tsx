import { usePosition } from './subgraph/usePosition'
import { useTokenDecimalsAndBalance } from './useTokenDecimalsAndBalance'
import { useERC20Allowance } from './useERC20Allowance'
import { WAD_DECIMALS, ZERO_BIG_NUMBER } from '../constants/misc'
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

// @TODO: we might need to use the values from the different forms
// eslint-disable-next-line
export const useManagePositionForm = (
  position: Position | undefined,
  positionFormFields: PositionManageFormFields | undefined,
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

  useEffect(() => {
    if (!position?.totalCollateral || !position?.totalNormalDebt) return
    const withdrawValue = calculateMaxWithdrawValue(
      position?.totalCollateral,
      position?.totalNormalDebt,
    )
    const mintValue = position?.totalCollateral.div(position?.vaultCollateralizationRatio ?? 1)
    const depositValue = tokenInfo?.humanValue
    const burnValue = position?.totalNormalDebt

    setMaxWithdrawValue(withdrawValue)
    setMaxMintValue(mintValue)
    setMaxDepositValue(depositValue)
    setMaxBurnValue(burnValue)
  }, [
    position?.totalCollateral,
    position?.vaultCollateralizationRatio,
    position?.totalNormalDebt,
    tokenInfo?.humanValue,
    calculateMaxWithdrawValue,
  ])

  const approveMonetaAllowance = useCallback(async () => {
    const MONETA = contracts.MONETA.address[appChainId]
    await approveFIAT(MONETA)
    setHasMonetaAllowance(true)
  }, [approveFIAT, appChainId])

  const handleFormChange = (args: PositionManageFormFields) => {
    if (!position?.totalCollateral || !position.totalNormalDebt) return
    const { burn, deposit, mint, withdraw } = args
    // @TODO: need to recalculate max amounts?
    // const toDeposit = deposit ? getNonHumanValue(deposit, WAD_DECIMALS) : ZERO_BIG_NUMBER
    // const toWithdraw = withdraw ? getNonHumanValue(withdraw, WAD_DECIMALS) : ZERO_BIG_NUMBER
    // const toMint = mint ? getNonHumanValue(mint, WAD_DECIMALS) : ZERO_BIG_NUMBER
    // const toBurn = burn ? getNonHumanValue(burn, WAD_DECIMALS) : ZERO_BIG_NUMBER
    // let newCollateral = getHumanValue(position?.totalCollateral, WAD_DECIMALS)
    // let newFiat = getHumanValue(position?.totalNormalDebt, WAD_DECIMALS)
    // let newCollateral = position?.totalCollateral.plus(toDeposit).minus(toWithdraw)
    // let newFiat = position?.totalNormalDebt.plus(toMint).minus(toBurn)
    // const withdrawValue = calculateMaxWithdrawValue(newCollateral, newFiat)
    // const mintValue = newCollateral.div(position?.vaultCollateralizationRatio ?? 1)
    // const depositValue = tokenInfo?.humanValue
    // const burnValue = newFiat
    // setMaxWithdrawValue(withdrawValue)
    // setMaxMintValue(mintValue)
    // setMaxDepositValue(depositValue)
    // setMaxBurnValue(burnValue)

    if (deposit) {
      console.log('deposit health factor increase: RED -> GREEN')
      setHealthFactor(calculateHF(deposit, ZERO_BIG_NUMBER))
    }
    if (withdraw) {
      console.log('withdraw health factor decrease: GREEN -> RED')
      setHealthFactor(calculateHF(withdraw.negated(), ZERO_BIG_NUMBER))
    }
    if (mint) {
      console.log('mint health factor decrease: GREEN -> RED')
      setHealthFactor(calculateHF(ZERO_BIG_NUMBER, mint))
      // @TODO: need to use burn amount
      // if (mint.gte(burn)) {
      //   const text = 'Execute'
      //   setButtonText(text)
      // }
      const text = 'Execute'
      setButtonText(text)
    }
    if (burn) {
      console.log('burn health factor increase: RED -> GREEN')
      // @TODO: need to use mint amount
      // if (burn.gte(mint)) {
      //   const text = !hasFiatAllowance
      //     ? 'Set allowance for Proxy'
      //     : !hasMonetaAllowance
      //     ? 'Enable Proxy for FIAT'
      //     : 'Execute'
      //   setButtonText(text)
      // }
      const text = !hasFiatAllowance
        ? 'Set allowance for Proxy'
        : !hasMonetaAllowance
        ? 'Enable Proxy for FIAT'
        : 'Execute'
      setButtonText(text)
      setHealthFactor(calculateHF(ZERO_BIG_NUMBER, burn.negated()))
    }
  }

  useEffect(() => {
    const text = !hasFiatAllowance
      ? 'Set allowance for Proxy'
      : !hasMonetaAllowance
      ? 'Enable Proxy for FIAT'
      : 'Execute'
    setButtonText(text)
  }, [hasFiatAllowance, hasMonetaAllowance])

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

      console.log({ position })
      console.log({ toDeposit: toDeposit.toString() })
      console.log({ toWithdraw: toWithdraw.toString() })
      console.log({ toMint: toMint.toString() })
      console.log({ toBurn: toBurn.toString() })

      setIsLoading(true)
      // @TODO: we should use the new values into a single call the modify method
      // modifyCollateralAndDebt(....) not working ATM
      await modifyCollateralAndDebt({
        vault: position?.protocolAddress,
        token: position?.collateral.address,
        tokenId: 0,
        // deltaCollateral: toDeposit.minus(toWithdraw),
        // deltaNormalDebt: toMint.minus(toBurn),
        deltaCollateral: ZERO_BIG_NUMBER,
        deltaNormalDebt: ZERO_BIG_NUMBER,
      })
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
  return [
    {
      title: 'Current collateral deposited',
      value: getHumanValue(position.totalCollateral, WAD_DECIMALS).toFixed(3),
    },
    {
      title: 'New collateral deposited',
      value: getHumanValue(position.totalCollateral, WAD_DECIMALS)
        .plus(deposit)
        .minus(withdraw)
        .toFixed(3),
    },
    {
      title: 'Outstanding FIAT debt',
      value: mint.plus(burn.negated()).toFixed(3),
    },
    {
      title: 'New FIAT debt',
      value: getHumanValue(position.totalNormalDebt, WAD_DECIMALS)
        .plus(mint)
        .minus(burn)
        .toFixed(3),
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
