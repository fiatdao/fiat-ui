import s from './s.module.scss'
import { SLIPPAGE, SUCCESS_STEP } from '@/src/constants/auctions'
import {
  FIAT_TICKER,
  INFINITE_BIG_NUMBER,
  INSUFFICIENT_BALANCE_TEXT,
  ONE_BIG_NUMBER,
  WAD_DECIMALS,
  ZERO_BIG_NUMBER,
} from '@/src/constants/misc'
import SuccessAnimation from '@/src/resources/animations/success-animation.json'
import { Form } from '@/src/components/antd'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { ButtonBack } from '@/src/components/custom/button-back'
import { InfoBlock } from '@/src/components/custom/info-block'
import TokenAmount from '@/src/components/custom/token-amount'
import withRequiredConnection from '@/src/hooks/RequiredConnection'
import { useAuction } from '@/src/hooks/subgraph/useAuction'
import { useDynamicTitle } from '@/src/hooks/useDynamicTitle'
import { useFIATBalance } from '@/src/hooks/useFIATBalance'
import { useBuyCollateralForm } from '@/src/hooks/useBuyCollateralForm'
import { useQueryParam } from '@/src/hooks/useQueryParam'
import { Summary } from '@/src/components/custom/summary'
import Lottie from 'lottie-react'
import Link from 'next/link'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import { useMemo, useState } from 'react'

const StepperTitle: React.FC<{
  currentStep: number
  description: string
  title: string
  totalSteps: number
}> = ({ currentStep, description, title, totalSteps }) => (
  <div className={cn(s.stepperWrapper)}>
    <div className={cn(s.stepperTitleWrapper)}>
      <h2 className={cn(s.stepperTitle)}>{title}</h2>
      <div className={s.steps}>
        <span className={s.currentStep}>{currentStep}</span>/{totalSteps}
      </div>
    </div>
    <p className={cn(s.stepperDescription)}>{description}</p>
  </div>
)

type FormProps = { amountToBuy: BigNumber }

type Step = {
  description: string
  buttonText: string
  prev: () => void
  next: () => void
  callback: () => void | Promise<void>
}

const BuyCollateral = () => {
  const auctionId = useQueryParam('auctionId')
  const { data: auctionData } = useAuction(auctionId)
  const [form] = AntdForm.useForm<FormProps>()
  const {
    approve,
    approveMoneta,
    buyCollateral,
    hasAllowance,
    hasMonetaAllowance,
    loading,
    maxCredit,
    maxPrice,
    /* oldMaxCredit, */
    /* oldMaxPrice, */
  } = useBuyCollateralForm(auctionData)
  const [FIATBalance, refetchFIATBalance] = useFIATBalance(true)
  const [isDebtSufficient, setIsDebtSufficient] = useState(false)
  const [amountToBuy, setAmountToBuy] = useState(ZERO_BIG_NUMBER)
  const [step, setStep] = useState(0)

  const fiatToPay = useMemo(() => {
    return (
      amountToBuy?.multipliedBy(auctionData?.currentAuctionPrice ?? ZERO_BIG_NUMBER) ??
      ZERO_BIG_NUMBER
    )
  }, [amountToBuy, auctionData?.currentAuctionPrice])

  const minimumToBuy = auctionData?.debt
    ?.minus(auctionData?.vault?.auctionDebtFloor ?? ZERO_BIG_NUMBER)
    .dividedBy(auctionData.currentAuctionPrice ?? ONE_BIG_NUMBER)

  const onValuesChange = ({ amountToBuy = ZERO_BIG_NUMBER }: { amountToBuy?: BigNumber }) => {
    setAmountToBuy(amountToBuy)

    if (auctionData?.debt) {
      const fiatToPay = amountToBuy.multipliedBy(auctionData.currentAuctionPrice as BigNumber)

      // DEBUG (very helpful don't delete)
      console.log({
        auctionDebtFloor: auctionData?.vault?.auctionDebtFloor?.unscaleBy(WAD_DECIMALS).toFixed(),
        debt: auctionData.debt.unscaleBy(WAD_DECIMALS).toFixed(),
        fiatToPay: fiatToPay.toFixed(),
        leftoverDebt: auctionData.debt.unscaleBy(WAD_DECIMALS).minus(fiatToPay).toFixed(),
      })

      // 1. Check if debt after purchase (leftoverDebt) would be <= auctionDebtFloor.
      const leftoverDebt = auctionData.debt.unscaleBy(WAD_DECIMALS).minus(fiatToPay)
      const purchaseWouldPushDebtBelowFloor = leftoverDebt.lte(
        auctionData?.vault?.auctionDebtFloor?.unscaleBy(WAD_DECIMALS) as BigNumber,
      )

      // 2. If purchase would push debt below floor, ensure user is buying all collateral
      if (purchaseWouldPushDebtBelowFloor) {
        // In the case where user must buy all collateral, if auctionedCollateral is undefined,
        // default it to +infinity to prevent runtime errors or buying such that leftoverDebt < debtFloor
        setIsDebtSufficient(
          amountToBuy.gte(auctionData?.auctionedCollateral ?? INFINITE_BIG_NUMBER),
        )
      } else {
        // Valid fractional purchase
        setIsDebtSufficient(true)
      }

      // 3 Q: is there a case where debt can be less than auctionDebtFloor? i remember seeing something about this in the contracts,
      // even though we would block it from the UI
    }
  }

  const steps: Step[] = [
    {
      // previous description
      description: 'Select the amount to buy',
      buttonText: 'Buy collateral',
      next() {
        if (!hasAllowance) {
          setStep(1)
        } else if (!hasMonetaAllowance) {
          setStep(2)
        } else {
          setStep(3)
        }
      },
      prev() {
        return
      },
      callback() {
        this.next()
      },
    },
    {
      description: 'Set Allowance for FIAT',
      buttonText: 'Set Allowance for FIAT',
      next() {
        if (!hasMonetaAllowance) {
          setStep(2)
        } else {
          setStep(3)
        }
      },
      prev() {
        setStep(0)
      },
      async callback() {
        await approve()
        this.next()
      },
    },
    {
      description: 'Enable Proxy for FIAT',
      buttonText: 'Enable Proxy for FIAT',
      next() {
        setStep(3)
      },
      prev() {
        if (!hasAllowance) {
          setStep(1)
        } else {
          setStep(0)
        }
      },
      async callback() {
        await approveMoneta()
        this.next()
      },
    },
    {
      description: 'Confirm the details',
      buttonText: 'Confirm',
      next() {
        return
      },
      prev() {
        if (!hasMonetaAllowance) {
          setStep(2)
        } else if (!hasAllowance) {
          setStep(1)
        } else {
          setStep(0)
        }
      },
      callback() {
        form.submit()
      },
    },
  ]

  const isFiatBalanceSufficient = FIATBalance.gte(fiatToPay)

  const getButtonTextForStep = (stepNumber: number): string => {
    if (!isDebtSufficient) {
      return `Must purchase <${minimumToBuy
        ?.unscaleBy(WAD_DECIMALS)
        .toFixed(2)} or buy all collateral`
    }
    if (!isFiatBalanceSufficient) {
      return INSUFFICIENT_BALANCE_TEXT
    }
    return steps[stepNumber].buttonText
  }

  useDynamicTitle(auctionData?.protocol && `Buy ${auctionData.protocol.humanReadableName}`)

  const onSubmit = async () => {
    if (!auctionData?.currentAuctionPrice) {
      console.error('unavailable auctionData')
      return
    }

    // collateral amount to send with slippage?
    const collateralAmountToSend = form
      .getFieldValue('amountToBuy')
      .multipliedBy(SLIPPAGE.plus(1))
      .decimalPlaces(WAD_DECIMALS)
      .scaleBy(WAD_DECIMALS)
    console.log('collat to send: ', collateralAmountToSend.toString())
    console.log(
      'user input: ',
      form
        .getFieldValue('amountToBuy')
        .decimalPlaces(WAD_DECIMALS)
        .scaleBy(WAD_DECIMALS)
        .toString(),
    )

    const receipt = await buyCollateral({ collateralAmountToSend, maxPrice })

    // tx was not successful
    if (receipt) {
      await refetchFIATBalance()
      setStep((prev) => prev + 1)
    }
  }

  const blocksData = [
    {
      title: 'Auctioned Collateral',
      tooltip: 'Units of this collateral type that are currently being auctioned.',
      value: auctionData?.auctionedCollateral?.toFixed(2),
    },
    {
      title: 'Current Auction Price',
      tooltip: 'The current FIAT price at which the collateral can be bought.',
      value: `${auctionData?.currentAuctionPrice?.toFixed(4)} ${FIAT_TICKER}`,
    },
    {
      title: 'Face Value',
      tooltip: 'The amount of underlying tokens available for redemption at maturity.',
      value: `$${auctionData?.faceValue?.toFixed(4)}`,
    },
    {
      title: 'APY',
      tooltip:
        'The annualized yield as implied by the Current Auction Price and collateral maturity.',
      value: `${auctionData?.apy}%`,
    },
  ]

  const summaryData = [
    {
      title: 'Asset',
      value: `${auctionData?.asset}`,
    },
    {
      title: 'Amount',
      value: `${form.getFieldValue('amountToBuy')?.toFixed(4)}`,
    },
    {
      title: 'Current Auction Price',
      value: `${auctionData?.currentAuctionPrice?.toFixed(4)} ${FIAT_TICKER}`,
    },
    {
      title: 'Estimated FIAT to pay',
      value: `${fiatToPay.toFixed(4) ?? 0} ${FIAT_TICKER}`,
    },
    {
      title: 'APY',
      value: `${auctionData?.apy}%`,
    },
  ]

  return (
    <>
      <ButtonBack href="/auctions">Back</ButtonBack>
      <div className={cn(s.mainContainer)}>
        <div className={cn(s.infoBlocks)}>
          {blocksData.map((item, index) => (
            <InfoBlock
              key={`${index}_info`}
              title={item.title}
              tooltip={item.tooltip || ''}
              value={item.value}
            />
          ))}
        </div>

        <div className={cn(s.formWrapper)}>
          {step + 1 !== SUCCESS_STEP ? (
            <>
              <StepperTitle
                currentStep={step + 1}
                description={steps[step].description}
                title={'Buy collateral'}
                totalSteps={steps.length}
              />
              <div className={cn(s.form)}>
                {step === 0 ? (
                  <>
                    <div className={cn(s.balanceWrapper)}>
                      <h3 className={cn(s.balanceLabel)}>Select amount</h3>
                      <p className={cn(s.balance)}>Balance: {FIATBalance?.toFixed(2)} FIAT</p>
                    </div>

                    <Form
                      form={form}
                      initialValues={{ amountToBuy: 0 }}
                      onFinish={onSubmit}
                      onValuesChange={onValuesChange}
                    >
                      <Form.Item name="amountToBuy" required>
                        <TokenAmount
                          displayDecimals={4}
                          mainAsset={auctionData?.protocol.name ?? ''}
                          max={maxCredit}
                          maximumFractionDigits={6}
                          numericInputDisabled={loading}
                          secondaryAsset={auctionData?.underlier.symbol}
                          slider
                          sliderDisabled={loading}
                        />
                      </Form.Item>
                      <ButtonGradient
                        disabled={loading || !isDebtSufficient || !isFiatBalanceSufficient}
                        height="lg"
                        onClick={steps[step].next}
                      >
                        {getButtonTextForStep(step)}
                      </ButtonGradient>

                      <div className={cn(s.summary)}>
                        <Summary data={summaryData} />
                      </div>
                    </Form>
                  </>
                ) : (
                  <>
                    {step === 3 && <Summary data={summaryData} />}
                    <div className={s.buttonsWrapper}>
                      <ButtonGradient
                        disabled={loading || !isFiatBalanceSufficient}
                        height="lg"
                        loading={loading}
                        onClick={steps[step].callback.bind(steps[step])}
                      >
                        {getButtonTextForStep(step)}
                      </ButtonGradient>
                      <button
                        className={s.backButton}
                        disabled={loading}
                        onClick={steps[step].prev}
                      >
                        &#8592; Go back
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <div className={cn(s.form)}>
              <div className={cn(s.lastStepAnimation)}>
                <Lottie animationData={SuccessAnimation} autoplay loop />
              </div>
              <h1 className={cn(s.lastStepTitle)}>Congrats!</h1>
              <p className={cn(s.lastStepText)}>You have successfully bought collateral tokens.</p>
              <Summary data={summaryData} />
              <Link href={`/auctions/`} passHref>
                <ButtonGradient height="lg">Go to Auctions</ButtonGradient>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default withRequiredConnection(BuyCollateral)
