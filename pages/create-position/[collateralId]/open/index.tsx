import s from './s.module.scss'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { RadioTab, RadioTabsWrapper } from '@/src/components/antd/radio-tab'
import { ButtonBack } from '@/src/components/custom/button-back'
import { CreatePositionBond } from '@/src/components/custom/create-position-bond'
import { CreatePositionUnderlying } from '@/src/components/custom/create-position-underlying'
import { PositionFormsLayout } from '@/src/components/custom/position-forms-layout'
import SafeSuspense from '@/src/components/custom/safe-suspense'
import { Summary } from '@/src/components/custom/summary'
import { DEFAULT_HEALTH_FACTOR } from '@/src/constants/healthFactor'
import {
  DEPOSIT_COLLATERAL_TEXT,
  DEPOSIT_UNDERLYING_TEXT,
  EST_FIAT_TOOLTIP_TEXT,
  EST_HEALTH_FACTOR_TOOLTIP_TEXT,
  INSUFFICIENT_BALANCE_TEXT,
  ONE_BIG_NUMBER,
  WAD_DECIMALS,
  ZERO_BIG_NUMBER,
  getBorrowAmountBelowDebtFloorText,
} from '@/src/constants/misc'
import withRequiredConnection from '@/src/hooks/RequiredConnection'
import { useCollateral } from '@/src/hooks/subgraph/useCollateral'
import { useUnderlierToFCash } from '@/src/hooks/underlierToFCash'
import { useDynamicTitle } from '@/src/hooks/useDynamicTitle'
import { useERC155Allowance } from '@/src/hooks/useERC1155Allowance'
import { useERC20Allowance } from '@/src/hooks/useERC20Allowance'
import { useQueryParam } from '@/src/hooks/useQueryParam'
import { useTokenDecimalsAndBalance } from '@/src/hooks/useTokenDecimalsAndBalance'
import { useUnderlyingExchangeValue } from '@/src/hooks/useUnderlyingExchangeValue'
import useUserProxy from '@/src/hooks/useUserProxy'
import { getTokenBySymbol } from '@/src/providers/knownTokensProvider'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import SuccessAnimation from '@/src/resources/animations/success-animation.json'
import stepperMachine, { TITLES_BY_STEP } from '@/src/state/open-position-form'
import { TITLES_BY_STEP_UNDERLYING } from '@/src/state/open-position-underlying-form'
import { Collateral } from '@/src/utils/data/collaterals'
import { calculateHealthFactor, isValidHealthFactor } from '@/src/utils/data/positions'
import { parseDate } from '@/src/utils/dateTime'
import { getHealthFactorState } from '@/src/utils/table'
import {
  getEtherscanAddressUrl,
  getHumanValue,
  getNonHumanValue,
  perSecondToAPR,
} from '@/src/web3/utils'
import { SHOW_UNDERLYING_FLOW } from '@/src/utils/featureFlags'
import StepperTitle from '@/src/components/custom/stepper-title'
import { useMachine } from '@xstate/react'
import cn from 'classnames'
import Lottie from 'lottie-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

enum CreatePositionTab {
  asset = 'asset',
  underlying = 'tab',
}

// @TODO: hardcoded step from open-position-form
const LAST_STEP = 7

const FormERC20: React.FC<{
  tokenSymbol: string
  tokenAsset: string
  tokenAddress: string
  collateral: Collateral
}> = ({ collateral, tokenAddress, tokenSymbol }) => {
  const { address: currentUserAddress, readOnlyAppProvider } = useWeb3Connection()
  const { isProxyAvailable, userProxyAddress } = useUserProxy()
  const [loading, setLoading] = useState(false)

  const erc20 = useERC20Allowance(tokenAddress, userProxyAddress ?? '')
  const erc1155 = useERC155Allowance(tokenAddress, userProxyAddress ?? '')

  const underlierDecimals = getTokenBySymbol(collateral.underlierSymbol ?? '')?.decimals

  const [underlierToPToken] = useUnderlyingExchangeValue({
    vault: collateral?.vault?.address ?? '',
    balancerVault: collateral?.eptData?.balancerVault,
    curvePoolId: collateral?.eptData?.poolId,
    underlierAmount: getNonHumanValue(ONE_BIG_NUMBER, underlierDecimals), //single underlier value
  })

  const [underlierToFCash] = useUnderlierToFCash({
    tokenId: collateral.tokenId ?? '',
    amount: getNonHumanValue(ONE_BIG_NUMBER, underlierDecimals), //single underlier value
  })

  const setFormLoading = (newLoadingState: boolean): void => {
    setLoading(newLoadingState)
  }

  const { tokenInfo } = useTokenDecimalsAndBalance({
    tokenData: {
      symbol: collateral.symbol ?? '',
      address: collateral.address ?? '',
      decimals: 8, // TODO: Fix me
    },
    vaultType: collateral.vault.type ?? '',
    tokenId: collateral.tokenId ?? '0',
    address: currentUserAddress,
    readOnlyAppProvider,
  })

  const { tokenInfo: underlyingInfo } = useTokenDecimalsAndBalance({
    tokenData: {
      decimals: 8,
      symbol: collateral.underlierSymbol ?? '',
      address: collateral?.underlierAddress ?? '',
    },
    address: currentUserAddress,
    readOnlyAppProvider,
    tokenId: collateral.tokenId ?? '0',
  })

  const activeToken = collateral.vault.type === 'NOTIONAL' ? erc1155 : erc20
  const { hasAllowance } = activeToken
  const [stateMachine] = useMachine(stepperMachine, {
    context: {
      isProxyAvailable,
      hasAllowance,
      tokenAddress,
      tokenSymbol,
    },
  })

  const [activeMachine, setActiveMachine] = useState(stateMachine)

  const [tab, setTab] = useState(CreatePositionTab.asset)

  const hasMinimumFIAT = useMemo(() => {
    const fiatAmount = activeMachine.context.fiatAmount ?? ZERO_BIG_NUMBER
    const debtFloor = collateral.vault.debtFloor
    const nonHumanFiatAmount = getNonHumanValue(fiatAmount, WAD_DECIMALS) ?? ZERO_BIG_NUMBER
    return nonHumanFiatAmount.gte(debtFloor) || nonHumanFiatAmount.isZero()
  }, [activeMachine.context.fiatAmount, collateral.vault.debtFloor])

  const hasSufficientCollateral = useMemo(() => {
    return tab === CreatePositionTab.asset
      ? tokenInfo?.humanValue?.gte(activeMachine.context.erc20Amount)
      : underlyingInfo?.humanValue?.gte(activeMachine.context.underlierAmount)
  }, [
    tab,
    tokenInfo?.humanValue,
    underlyingInfo?.humanValue,
    activeMachine.context.erc20Amount,
    activeMachine.context.underlierAmount,
  ])

  const confirmButtonText = useMemo(() => {
    if (!hasMinimumFIAT) {
      return getBorrowAmountBelowDebtFloorText(collateral.vault.debtFloor)
    }
    if (!hasSufficientCollateral) {
      return INSUFFICIENT_BALANCE_TEXT
    }
    return tab === CreatePositionTab.asset ? DEPOSIT_COLLATERAL_TEXT : DEPOSIT_UNDERLYING_TEXT
  }, [tab, hasMinimumFIAT, hasSufficientCollateral, collateral.vault.debtFloor])

  const marketRate =
    collateral.vault.type === 'NOTIONAL'
      ? ONE_BIG_NUMBER.div(getHumanValue(underlierToFCash, 77)) // Why is this number 77? This is what I currently have to use based on what Im recieving from the contract call but this doesnt seem right
      : ONE_BIG_NUMBER.div(getHumanValue(underlierToPToken, underlierDecimals))

  // const priceImpact = (1 - marketRate) / 0.01

  // TODO: figure out why deltaCollateral is 0. This is keeping health factor from displaying properly. This is probably a scaling issue
  const deltaCollateral = getNonHumanValue(
    tab === CreatePositionTab.asset
      ? activeMachine.context.erc20Amount
      : marketRate.times(activeMachine.context.underlierAmount),
    WAD_DECIMALS,
  )
  const deltaDebt = getNonHumanValue(activeMachine.context.fiatAmount, WAD_DECIMALS)

  const { healthFactor: hf } = calculateHealthFactor(
    collateral.currentValue,
    collateral.vault.collateralizationRatio,
    deltaCollateral,
    deltaDebt,
  )

  const summaryData = [
    {
      title: 'In your wallet',
      value:
        tab === CreatePositionTab.asset
          ? `${tokenInfo?.humanValue?.toFixed(3)} ${tokenSymbol}`
          : `${underlyingInfo?.humanValue?.toFixed(3)} ${collateral.underlierSymbol}`,
    },
    {
      title: 'Depositing into position',
      value:
        tab === CreatePositionTab.asset
          ? `${activeMachine.context.erc20Amount.toFixed(3)} ${tokenSymbol}`
          : `${activeMachine.context.underlierAmount.toFixed(3)} ${collateral.underlierSymbol}`,
    },
    {
      title: 'Remaining in wallet',
      value:
        tab === CreatePositionTab.asset
          ? `${tokenInfo?.humanValue
              ?.minus(activeMachine.context.erc20Amount)
              .toFixed(4)} ${tokenSymbol}`
          : `${underlyingInfo?.humanValue
              ?.minus(activeMachine.context.underlierAmount)
              .toFixed(4)} ${collateral.underlierSymbol}`,
    },
    {
      title: 'Estimated FIAT debt',
      titleTooltip: EST_FIAT_TOOLTIP_TEXT,
      value: `${activeMachine.context.fiatAmount.toFixed(3)} FIAT`,
    },
    {
      state: getHealthFactorState(hf),
      title: 'Estimated Health Factor',
      titleTooltip: EST_HEALTH_FACTOR_TOOLTIP_TEXT,
      value: isValidHealthFactor(hf) ? hf.toFixed(3) : DEFAULT_HEALTH_FACTOR,
    },
  ]

  const switchActiveMachine = (machine: any) => {
    setActiveMachine(machine)
  }

  const activeTitles = tab === CreatePositionTab.asset ? TITLES_BY_STEP : TITLES_BY_STEP_UNDERLYING

  if (activeMachine.context.currentStepNumber === LAST_STEP) {
    // Return success gif and position summary for last step
    return (
      <div className={cn(s.form)}>
        <div className={cn(s.lastStepAnimation)}>
          <Lottie animationData={SuccessAnimation} autoplay loop />
        </div>
        <h1 className={cn(s.lastStepTitle)}>Congrats!</h1>
        <p className={cn(s.lastStepText)}>
          Your position has been successfully created! It may take a couple seconds for your
          position to show in the app.
        </p>
        <Summary data={summaryData} />
        <Link href={`/your-positions/`} passHref>
          <ButtonGradient height="lg">Go to Your Positions</ButtonGradient>
        </Link>
      </div>
    )
  }

  return (
    <>
      <StepperTitle
        currentStep={activeMachine.context.currentStepNumber}
        description={activeTitles[activeMachine.context.currentStepNumber].subtitle}
        title={activeTitles[activeMachine.context.currentStepNumber].title}
        totalSteps={activeMachine.context.totalStepNumber}
      />
      <div className={cn(s.form)}>
        {[1, 4].includes(activeMachine.context.currentStepNumber) &&
          SHOW_UNDERLYING_FLOW && ( // Feature Flag
            <RadioTabsWrapper className={cn(s.radioTabsWrapper)}>
              <RadioTab
                checked={tab === CreatePositionTab.asset}
                onClick={() => setTab(CreatePositionTab.asset)}
              >
                Asset
              </RadioTab>
              <RadioTab
                checked={tab === CreatePositionTab.underlying}
                onClick={() => setTab(CreatePositionTab.underlying)}
              >
                Underlying
              </RadioTab>
            </RadioTabsWrapper>
          )}
        {tab === CreatePositionTab.underlying ? (
          <CreatePositionUnderlying
            collateral={collateral}
            confirmButtonText={confirmButtonText}
            hasMinimumFIAT={hasMinimumFIAT}
            healthFactorNumber={hf}
            loading={loading}
            marketRate={marketRate}
            setLoading={setFormLoading}
            setMachine={switchActiveMachine}
          />
        ) : (
          <CreatePositionBond
            collateral={collateral}
            confirmButtonText={confirmButtonText}
            hasMinimumFIAT={hasMinimumFIAT}
            loading={loading}
            setLoading={setFormLoading}
            setMachine={switchActiveMachine}
            tokenAddress={tokenAddress}
          />
        )}
      </div>
    </>
  )
}

const OpenPosition = () => {
  const collateralId = useQueryParam('collateralId')
  useDynamicTitle(`Create Position`)
  const { data: collateral } = useCollateral(collateralId)

  const tokenSymbol = collateral?.symbol ?? ''
  const tokenAsset = collateral?.asset ?? ''
  const collateralizationRatio = collateral?.vault.collateralizationRatio ?? null
  const interestPerSecond = collateral?.vault.interestPerSecond ?? ZERO_BIG_NUMBER
  const chainId = useWeb3Connection().appChainId

  const infoBlocks = [
    {
      title: 'Token',
      value: tokenAsset ?? '-',
      url: getEtherscanAddressUrl(collateral?.address as string, chainId),
    },
    {
      title: 'Underlying Asset',
      value: collateral ? collateral.underlierSymbol : '-',
      url: collateral?.underlierAddress
        ? getEtherscanAddressUrl(collateral?.underlierAddress, chainId)
        : '',
    },
    {
      title: 'Maturity Date',
      tooltip: 'The date on which the bond is redeemable for its underlying assets.',
      value: collateral?.maturity ? parseDate(collateral?.maturity) : '--:--:--',
    },
    {
      title: 'Face Value',
      tooltip: 'The redeemable value of the bond at maturity.',
      value: `$${getHumanValue(collateral?.faceValue ?? 0, WAD_DECIMALS)?.toFixed(2)}`,
    },
    {
      title: 'Price',
      tooltip: 'The currently discounted value of the bond.',
      value: `$${getHumanValue(collateral?.currentValue ?? 0, WAD_DECIMALS)?.toFixed(2)}`,
    },
    {
      title: 'Collateralization Threshold',
      tooltip: 'The minimum amount of over-collateralization required to borrow FIAT.',
      value: collateralizationRatio
        ? `${getHumanValue(collateralizationRatio.times(100), WAD_DECIMALS)}%`
        : '-',
    },
    {
      title: 'Interest Rate',
      tooltip: 'The annualized cost of interest for minting FIAT.',
      value: `${perSecondToAPR(getHumanValue(interestPerSecond, WAD_DECIMALS)).toFixed(3)}%`,
    },
  ]

  return (
    <>
      <ButtonBack href="/create-position">Back</ButtonBack>
      <PositionFormsLayout infoBlocks={infoBlocks}>
        <SafeSuspense>
          <FormERC20
            collateral={collateral as Collateral}
            tokenAddress={collateral?.address as string}
            tokenAsset={tokenAsset}
            tokenSymbol={tokenSymbol}
          />
        </SafeSuspense>
      </PositionFormsLayout>
    </>
  )
}

export default withRequiredConnection(OpenPosition)
