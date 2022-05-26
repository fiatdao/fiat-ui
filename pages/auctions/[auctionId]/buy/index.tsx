import s from './s.module.scss'
import { SLIPPAGE, SUCCESS_STEP } from '@/src/constants/auctions'
import { FIAT_TICKER, WAD_DECIMALS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
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
import { useState } from 'react'
import cn from 'classnames'
import BigNumber from 'bignumber.js'
import AntdForm from 'antd/lib/form'
import Link from 'next/link'
import Lottie from 'lottie-react'

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
  const { data } = useAuction(auctionId)
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
  } = useBuyCollateralForm(data)

  const [isDebtSufficient, setIsDebtSufficient] = useState(false)

  const minimumToBuy = data?.vault?.auctionDebtFloor
    ?.plus(1)
    .unscaleBy(WAD_DECIMALS)
    .dividedBy(data.currentAuctionPrice as BigNumber)

  const onValuesChange = ({ amountToBuy = ZERO_BIG_NUMBER }: { amountToBuy?: BigNumber }) => {
    if (data?.debt) {
      const fiatToPay = amountToBuy.multipliedBy(data.currentAuctionPrice as BigNumber)

      // TODO: Leave this for debugging purposes
      // console.log({
      //   auctionDebtFloor: data?.vault?.auctionDebtFloor?.toFixed(),
      //   fiatToPay: fiatToPay.toFixed(),
      //   debt: data.debt.toFixed(),
      //   diff: data.debt.unscaleBy(WAD_DECIMALS).minus(fiatToPay).toFixed(),
      // })

      // 1. check if auction.debt - fiatToPay is less than or equal to auctionDebtFloor.
      //    if true then 2. otherwise proceed and skip 2.
      const dusty = data.debt
        .unscaleBy(WAD_DECIMALS)
        .minus(fiatToPay)
        .lte(data?.vault?.auctionDebtFloor?.unscaleBy(WAD_DECIMALS) as BigNumber)

      // 2. check that fiatToPay > auctionDebtFloor otherwise block
      setIsDebtSufficient(
        dusty
          ? fiatToPay.gt(data.vault.auctionDebtFloor?.unscaleBy(WAD_DECIMALS) as BigNumber)
          : true,
      )
    }
  }

  const minimumMessage = !isDebtSufficient
    ? ` (minimum: ${(minimumToBuy as BigNumber).toFixed(6)})`
    : ''

  const [step, setStep] = useState(0)
  const steps: Step[] = [
    {
      description: `Select the amount to buy${minimumMessage}`,
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

  useDynamicTitle(data?.protocol && `Buy ${data.protocol.humanReadableName}`)

  const [FIATBalance, refetchFIATBalance] = useFIATBalance()

  const onSubmit = async () => {
    if (!data?.currentAuctionPrice) {
      console.error('unavailable data')
      return
    }

    const collateralAmountToSend = form
      .getFieldValue('amountToBuy')
      .multipliedBy(SLIPPAGE.plus(1))
      .decimalPlaces(WAD_DECIMALS)
      .scaleBy(WAD_DECIMALS)

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
      value: data?.auctionedCollateral?.toFixed(2),
    },
    {
      title: 'Current Auction Price',
      tooltip: 'The current FIAT price at which the collateral can be bought.',
      value: `${data?.currentAuctionPrice?.toFixed(4)} ${FIAT_TICKER}`,
    },
    {
      title: 'Face Value',
      tooltip: 'The amount of underlying tokens available for redemption at maturity.',
      value: `$${data?.faceValue?.toFixed(4)}`,
    },
    {
      title: 'APY',
      tooltip:
        'The annualized yield as implied by the Current Auction Price and collateral maturity.',
      value: `${data?.apy}%`,
    },
  ]

  const summaryData = [
    {
      title: 'Asset',
      value: `${data?.asset}`,
    },
    {
      title: 'Amount',
      value: `${form.getFieldValue('amountToBuy')?.toFixed()}`,
    },
    {
      title: 'Current Auction Price',
      value: `${data?.currentAuctionPrice?.toFixed(4)} ${FIAT_TICKER}`,
    },
    {
      title: 'Buy price',
      value: `${
        form
          .getFieldValue('amountToBuy')
          ?.multipliedBy(data?.currentAuctionPrice ?? 0)
          .toFixed(4) ?? 0
      } ${FIAT_TICKER}`,
    },
    {
      title: 'APY',
      value: `${data?.apy}%`,
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
                      <p className={cn(s.balance)}>
                        Balance: {FIATBalance.unscaleBy(WAD_DECIMALS)?.toFixed(2)} FIAT
                      </p>
                    </div>

                    {/* FixMe: send proper value to `mainAsset` */}
                    <Form
                      form={form}
                      initialValues={{ amountToBuy: 0 }}
                      onFinish={onSubmit}
                      onValuesChange={onValuesChange}
                    >
                      <Form.Item name="amountToBuy" required>
                        <TokenAmount
                          disabled={loading}
                          displayDecimals={4}
                          mainAsset={data?.protocol.name ?? ''}
                          max={maxCredit}
                          maximumFractionDigits={6}
                          secondaryAsset={data?.underlier.symbol}
                          slider
                        />
                      </Form.Item>
                      <ButtonGradient
                        disabled={loading || !isDebtSufficient}
                        height="lg"
                        onClick={steps[step].next}
                      >
                        {isDebtSufficient ? steps[step].buttonText : 'No partial purchase possible'}
                      </ButtonGradient>
                    </Form>
                  </>
                ) : (
                  <>
                    {step === 3 && <Summary data={summaryData} />}
                    <div className={s.buttonsWrapper}>
                      <ButtonGradient
                        height="lg"
                        loading={loading}
                        onClick={steps[step].callback.bind(steps[step])}
                      >
                        {steps[step].buttonText}
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
