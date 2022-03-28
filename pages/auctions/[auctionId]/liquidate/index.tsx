import s from './s.module.scss'
import Lottie from 'lottie-react'
import Link from 'next/link'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import { useState } from 'react'
import { getTokenByAddress } from '@/src/constants/bondTokens'
import { WAD_DECIMALS } from '@/src/constants/misc'
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
import { useLiquidateForm } from '@/src/hooks/useLiquidateForm'
import { useQueryParam } from '@/src/hooks/useQueryParam'
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

  const { data } = useAuction(auctionId)

  useDynamicTitle(
    data?.collateral.address &&
      `Liquidate ${getTokenByAddress(data.collateral.address)?.symbol ?? ''}`,
  )

  const [FIATBalance, refetchFIATBalance] = useFIATBalance()

  const { approve, hasAllowance, liquidate, loading, notification } = useLiquidateForm(data)

  const onSubmit = async () => {
    // TODO SUM slippage fixed value
    const collateralAmountToSend = form
      .getFieldValue('liquidateAmount')
      .multipliedBy(SLIPPAGE_VALUE.plus(1))
      .scaleBy(WAD_DECIMALS)

    // maxPrice parameter calc TODO must be in USD?
    const maxPrice = FIATBalance.dividedBy(collateralAmountToSend)
      .decimalPlaces(WAD_DECIMALS)
      .scaleBy(WAD_DECIMALS)

    try {
      await liquidate({ collateralAmountToSend, maxPrice })
      await refetchFIATBalance()
      setStep(3)
    } catch (err) {
      // FixMe?: avoid using notification here and move it inside the `useLiquidateForm` hook
      notification.handleTxError(err)
    }
  }

  const blocksData = [
    {
      title: 'Collateral to Sell',
      tooltip: 'Units of this collateral type that are currently being auctioned.',
      value: data?.collateralToSell?.toFixed(2),
    },
    {
      title: 'Bid Price',
      tooltip: 'The amount of FIAT required to liquidate this collateral.',
      value: `$${data?.bidPrice?.toFixed(4)}`,
    },
    {
      title: 'Collateral Value',
      tooltip: 'The amount of underlying assets available for redemption at maturity.',
      value: `$${data?.collateralValue?.toFixed(4)}`,
    },
    {
      title: 'APY',
      tooltip:
        'The annualized yield as determined by the difference between Auction Price and Collateral Value.',
      value: `${data?.apy?.toFixed(2)}%`,
    },
  ]

  const summaryData = [
    {
      title: 'Token',
      value: `${data?.collateral.symbol}`,
    },
    {
      title: 'Amount',
      value: `${form.getFieldValue('liquidateAmount')?.toFixed()}`,
    },
    {
      title: 'Bid price',
      value: `$${data?.bidPrice?.toFixed(4)}`,
    },
    {
      title: 'Buy price',
      value: `${
        form
          .getFieldValue('liquidateAmount')
          ?.multipliedBy(data?.bidPrice ?? 0)
          .toFixed(4) ?? 0
      }`,
    },
    {
      title: 'APY',
      value: data?.apy.toFixed(4),
    },
  ]

  console.table({
    'faceValue (web3: `Vault20.fairPrice()`)': data?.collateralValue?.toFixed(),
    'bidPrice (web3: `CollateralAuction.getStatus()`)': data?.bidPrice?.toFixed(),
    'collateralMaturity (SG: `collateralAuction.collateralType.maturity`) / 265*86400':
      BigNumber.from(data?.collateralMaturity ?? 0)
        .dividedBy(365 * 86400)
        .toFixed(),
    APY: summaryData[4].value,
  })

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
                        Collateral left: ${data?.collateralToSell?.toFixed(2)}
                      </p>
                    </div>

                    <Form form={form} initialValues={{ liquidateAmount: 0 }} onFinish={onSubmit}>
                      <Form.Item name="liquidateAmount" required>
                        <TokenAmount
                          disabled={loading}
                          displayDecimals={4}
                          mainAsset={data?.protocol.name}
                          max={data?.collateralToSell}
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
                        {hasAllowance ? 'Confirm' : `Set Allowance for ${data?.collateral.symbol}`}
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
              <p className={cn(s.lastStepText)}>
                You have successfully liquidated (part of) the position.
              </p>
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
