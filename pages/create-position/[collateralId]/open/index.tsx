import s from './s.module.scss'
import { useERC155Allowance } from '../../../../src/hooks/useERC1155Allowance'
import { useMachine } from '@xstate/react'
import cn from 'classnames'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import Lottie from 'lottie-react'
import { RadioTab, RadioTabsWrapper } from '@/src/components/antd/radio-tab'
import SafeSuspense from '@/src/components/custom/safe-suspense'
import { getHealthFactorState } from '@/src/utils/table'
import { getEtherscanAddressUrl } from '@/src/web3/utils'
import withRequiredConnection from '@/src/hooks/RequiredConnection'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { ButtonBack } from '@/src/components/custom/button-back'
import { CreatePositionUnderlying } from '@/src/components/custom/create-position-underlying'
import { CreatePositionBond } from '@/src/components/custom/create-position-bond'
import { PositionFormsLayout } from '@/src/components/custom/position-forms-layout'
import { Summary } from '@/src/components/custom/summary'
import {
  VIRTUAL_RATE_MAX_SLIPPAGE,
  WAD_DECIMALS,
} from '@/src/constants/misc'
import { useDynamicTitle } from '@/src/hooks/useDynamicTitle'
import { useERC20Allowance } from '@/src/hooks/useERC20Allowance'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import stepperMachine, { TITLES_BY_STEP } from '@/src/state/open-position-form'
import { TITLES_BY_STEP as TITLES_BY_STEP_UNDERLYING }  from '@/src/state/open-position-underlying-form'
import { useQueryParam } from '@/src/hooks/useQueryParam'
import { useCollateral } from '@/src/hooks/subgraph/useCollateral'
import { Collateral } from '@/src/utils/data/collaterals'
import { parseDate } from '@/src/utils/dateTime'
import { ONE_BIG_NUMBER, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { getHumanValue, getNonHumanValue, perSecondToAPR } from '@/src/web3/utils'
import { useTokenDecimalsAndBalance } from '@/src/hooks/useTokenDecimalsAndBalance'
import SuccessAnimation from '@/src/resources/animations/success-animation.json'
import { calculateHealthFactor } from '@/src/utils/data/positions'

// @TODO: hardcoded step from open-position-form
const LAST_STEP = 7

const StepperTitle: React.FC<{
  currentStep: number
  description: string
  title: string
  totalSteps: number
}> = ({ currentStep, description, title, totalSteps }) => (
  <div className={cn(s.stepperWrapper)}>
    <div className={cn(s.stepperTitleWrapper)}>
      <h2 className={cn(s.stepperTitle)}>{title}</h2>
      <div className={cn(s.steps)}>
        <span className={cn(s.currentStep)}>{currentStep}</span>/{totalSteps}
      </div>
    </div>
    <p className={cn(s.stepperDescription)}>{description}</p>
  </div>
)

const FormERC20: React.FC<{
  tokenSymbol: string
  tokenAsset: string
  tokenAddress: string
  collateral: Collateral
}> = ({ collateral, tokenAddress, tokenSymbol }) => {
  const { address: currentUserAddress, readOnlyAppProvider } = useWeb3Connection()
  const { isProxyAvailable, userProxyAddress } = useUserProxy()
  const [loading, setLoading] = useState(false)

  const setFormLoading = (newLoadingState: boolean): void => {
    setLoading(newLoadingState)
  }

  const erc20 = useERC20Allowance(tokenAddress, userProxyAddress ?? '')
  const erc1155 = useERC155Allowance(tokenAddress, userProxyAddress ?? '')

  const activeToken = collateral.vault.type === 'NOTIONAL' ? erc1155 : erc20
  const { hasAllowance } = activeToken

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

  const [stateMachine] = useMachine(stepperMachine, {
    context: {
      isProxyAvailable,
      hasAllowance,
      tokenAddress,
      tokenSymbol,
    },
  })

  const [activeMachine, setActiveMachine] = useState(stateMachine)

  const [tab, setTab] = useState('bond')

  // @TODO: not working max amount
  // maxFIAT = totalCollateral*collateralValue/collateralizationRatio/(virtualRateSafetyMargin*virtualRate)-debt
  const maxBorrowAmountCalculated = useMemo(() => {
    const totalCollateral = stateMachine.context.erc20Amount ?? ZERO_BIG_NUMBER
    const collateralValue = getHumanValue(collateral.currentValue || ONE_BIG_NUMBER, WAD_DECIMALS)
    const collateralizationRatio = getHumanValue(
      collateral.vault.collateralizationRatio || ONE_BIG_NUMBER,
      WAD_DECIMALS,
    )

    const virtualRateWithMargin = VIRTUAL_RATE_MAX_SLIPPAGE.times(collateral.vault.virtualRate)
    const maxBorrowAmount = totalCollateral
      .times(collateralValue)
      .div(collateralizationRatio)
      .div(virtualRateWithMargin)

    return maxBorrowAmount
  }, [stateMachine.context.erc20Amount, collateral])

  // @TODO: ui should show that the minimum fiat to have in a position is the debtFloor
  const hasMinimumFIAT = useMemo(() => {
    const fiatAmount = stateMachine.context.fiatAmount ?? ZERO_BIG_NUMBER
    const debtFloor = collateral.vault.debtFloor
    const nonHumanFiatAmount = getNonHumanValue(fiatAmount, WAD_DECIMALS) ?? ZERO_BIG_NUMBER

    return nonHumanFiatAmount.gte(debtFloor) || nonHumanFiatAmount.isZero()
  }, [stateMachine.context.fiatAmount, collateral.vault.debtFloor])

  const isDisabledCreatePosition = () => {
    return !hasAllowance || !isProxyAvailable || loading || !hasMinimumFIAT
  }

  const deltaCollateral = getNonHumanValue(stateMachine.context.erc20Amount, WAD_DECIMALS)
  const deltaDebt = getNonHumanValue(stateMachine.context.fiatAmount, WAD_DECIMALS)
  const { healthFactor: hf } = calculateHealthFactor(
    collateral.currentValue,
    collateral.vault.collateralizationRatio,
    deltaCollateral,
    deltaDebt,
  )
  const healthFactorNumber = hf?.toFixed(3)

  const summaryData = [
    {
      title: 'In your wallet',
      value: `${tokenInfo?.humanValue} ${tokenSymbol}`,
    },
    {
      title: 'Depositing into position',
      value: `${stateMachine.context.erc20Amount.toFixed(4)} ${tokenSymbol}`,
    },
    {
      title: 'Remaining in wallet',
      value: `${tokenInfo?.humanValue
        ?.minus(stateMachine.context.erc20Amount)
        .toFixed(4)} ${tokenSymbol}`,
    },
    {
      title: 'FIAT to be minted',
      value: `${stateMachine.context.fiatAmount.toFixed(4)}`,
    },
    {
      state: getHealthFactorState(hf),
      title: 'Updated health factor',
      value: healthFactorNumber,
    },
  ]

  const switchActiveMachine = (machine: any) => {
    setActiveMachine(machine)
  }

  const activeTitles = tab === 'bond' ? TITLES_BY_STEP : TITLES_BY_STEP_UNDERLYING

  return (
    <>
      {activeMachine.context.currentStepNumber !== LAST_STEP ? (
        <>
          <StepperTitle
            currentStep={activeMachine.context.currentStepNumber}
            description={activeTitles[activeMachine.context.currentStepNumber].subtitle}
            title={activeTitles[activeMachine.context.currentStepNumber].title}
            totalSteps={activeMachine.context.totalStepNumber}
          />
          <div className={cn(s.form)}>
            {[1, 4].includes(activeMachine.context.currentStepNumber) && (
              <RadioTabsWrapper className={cn(s.radioTabsWrapper)}>
                <RadioTab checked={tab === 'bond'} onClick={() => setTab('bond')}>
                  Bond
                </RadioTab>
                <RadioTab checked={tab === 'underlying'} onClick={() => setTab('underlying')}>
                  Underlying
                </RadioTab>
              </RadioTabsWrapper>
            )}
            {tab === 'underlying' ? (
              <CreatePositionUnderlying
                collateral={collateral}
                loading={loading}
                healthFactorNumber={healthFactorNumber}
                maxBorrowAmountCalculated={maxBorrowAmountCalculated}
                isDisabledCreatePosition={isDisabledCreatePosition}
                setLoading={setFormLoading}
                setMachine={switchActiveMachine}
              />
            ) : (

              <CreatePositionBond
                collateral={collateral}
                loading={loading}
                maxBorrowAmountCalculated={maxBorrowAmountCalculated}
                isDisabledCreatePosition={isDisabledCreatePosition}
                setLoading={setFormLoading}
                setMachine={switchActiveMachine}
                tokenAddress={tokenAddress}
              />
            )}
          </div>
        </>
      ) : (
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
      )}
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
      tooltip: 'The minimum amount of over-collateralization required to mint FIAT.',
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
