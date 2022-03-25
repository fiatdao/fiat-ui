import s from './s.module.scss'
import Lottie from 'lottie-react'
import Link from 'next/link'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import { useState } from 'react'
import SuccessAnimation from '@/src/resources/animations/success-animation.json'
import { Form } from '@/src/components/antd'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { ButtonBack } from '@/src/components/custom/button-back'
import { InfoBlock } from '@/src/components/custom/info-block'
import TokenAmount from '@/src/components/custom/token-amount'
import { useTokenSymbol } from '@/src/hooks/contracts/useTokenSymbol'
import withRequiredConnection from '@/src/hooks/RequiredConnection'
import { useAuction } from '@/src/hooks/subgraph/useAuction'
import { useDynamicTitle } from '@/src/hooks/useDynamicTitle'
import { useFIATBalance } from '@/src/hooks/useFIATBalance'
import { useLiquidateForm } from '@/src/hooks/useLiquidateForm'
import { useQueryParam } from '@/src/hooks/useQueryParam'
import { getNonHumanValue } from '@/src/web3/utils'
import { Summary } from '@/src/components/custom/summary'

const SLIPPAGE_VALUE = BigNumber.from(0.02) // 2%
const LAST_STEP = 3

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

type FormProps = { liquidateAmount: BigNumber }

const LiquidateAuction = () => {
  const auctionId = useQueryParam('auctionId')

  const [form] = AntdForm.useForm<FormProps>()
  const [step, setStep] = useState(1)

  const { data } = useAuction(auctionId as string)
  const { tokenSymbol } = useTokenSymbol(data?.tokenAddress as string)

  useDynamicTitle(tokenSymbol && `Liquidate ${tokenSymbol} position`)

  const [FIATBalance, refetchFIATBalance] = useFIATBalance()

  const { approve, hasAllowance, liquidate, loading } = useLiquidateForm(data)

  const onSubmit = async () => {
    // TODO SUM slippage fixed value
    const collateralAmountToSend = getNonHumanValue(
      form.getFieldValue('liquidateAmount').multipliedBy(SLIPPAGE_VALUE.plus(BigNumber.from(1))),
      18,
    )

    // maxPrice parameter calc TODO must be in USD?
    const maxPrice = getNonHumanValue(
      FIATBalance.dividedBy(collateralAmountToSend).decimalPlaces(18),
      18,
    )

    try {
      await liquidate({ collateralAmountToSend, maxPrice })
      await refetchFIATBalance()
      setStep(3)
    } catch (err) {
      // TODO: shall we add an error state in the form, besides the notification?
      console.error('failed to approve', err)
    }
  }

  const blocksData = [
    {
      title: 'Up for Auction',
      tooltip: 'Units of this collateral type that are currently being auctioned.',
      value: data?.upForAuction || undefined,
    },
    {
      title: 'Auction Price',
      tooltip: 'The amount of FIAT required to liquidate this collateral.',
      value: `$${data?.price}`,
    },
    {
      title: 'Collateral Value',
      tooltip: 'The amount of underlying assets available for redemption at maturity.',
      value: `$${data?.collateralValue}`,
    },
    {
      title: 'Yield',
      tooltip:
        'The annualized yield as determined by the difference between Auction Price and Collateral Value.',
      value: `${data?.yield}%`,
    },
  ]

  // TODO: remove hardcoded data: https://github.com/fiatdao/fiat-ui/issues/124
  const summaryData = [
    {
      title: 'Amount',
      value: `5,000 DAI Principal Token`,
    },
    {
      title: 'Current price',
      value: `5,000 DAI Principal Token`,
    },
    {
      title: 'Total value',
      value: `0 DAI Principal Token`,
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
          {step !== LAST_STEP ? (
            <>
              <StepperTitle
                currentStep={step}
                description={
                  step === 1 ? 'Select the amount to be liquidated' : 'Confirm the details'
                }
                title={'Liquidate a position'}
                totalSteps={2}
              />
              <div className={cn(s.form)}>
                {step === 1 && (
                  <>
                    <div className={cn(s.balanceWrapper)}>
                      <h3 className={cn(s.balanceLabel)}>Select amount</h3>
                      <p className={cn(s.balance)}>
                        Collateral left: ${Number(data?.upForAuction)}
                      </p>
                    </div>

                    <Form form={form} initialValues={{ liquidateAmount: 0 }} onFinish={onSubmit}>
                      <Form.Item name="liquidateAmount" required>
                        <TokenAmount
                          disabled={loading}
                          displayDecimals={4}
                          mainAsset={data?.protocol}
                          max={Number(data?.upForAuction)}
                          maximumFractionDigits={6}
                          secondaryAsset={data?.underlier.symbol}
                          slider
                        />
                      </Form.Item>
                      <ButtonGradient disabled={loading} height="lg" onClick={() => setStep(2)}>
                        Liquidate
                      </ButtonGradient>
                    </Form>
                  </>
                )}
                {step === 2 && (
                  <>
                    <Summary data={summaryData} />
                    <div className={s.buttonsWrapper}>
                      <ButtonGradient
                        height="lg"
                        loading={loading}
                        onClick={() => (hasAllowance ? form.submit() : approve())}
                      >
                        {hasAllowance ? 'Confirm' : `Set Allowance for ${tokenSymbol}`}
                      </ButtonGradient>
                      <button
                        className={s.backButton}
                        disabled={loading}
                        onClick={() => setStep(1)}
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
              <p className={cn(s.lastStepText)}>You have successfully liquidated the position.</p>
              <Summary data={summaryData} />
              <Link href={`/your-positions/`} passHref>
                <ButtonGradient height="lg">Go to Your Positions</ButtonGradient>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default withRequiredConnection(LiquidateAuction)
