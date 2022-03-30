import s from './s.module.scss'
import Lottie from 'lottie-react'
import Link from 'next/link'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import { useState } from 'react'
import { LAST_STEP, SLIPPAGE } from '@/src/constants/auctions'
import { getTokenByAddress } from '@/src/constants/bondTokens'
import { FIAT_TICKER, WAD_DECIMALS } from '@/src/constants/misc'
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

  const [, refetchFIATBalance] = useFIATBalance()

  const {
    approve,
    approveMoneta,
    hasAllowance,
    hasMonetaAllowance,
    liquidate,
    loading,
    maxCredit,
    maxPrice,
  } = useLiquidateForm(data)

  const onSubmit = async () => {
    if (!data?.currentAuctionPrice) {
      console.error('unavailable data')
      return
    }

    const collateralAmountToSend = form
      .getFieldValue('liquidateAmount')
      .multipliedBy(SLIPPAGE.plus(1))
      .decimalPlaces(WAD_DECIMALS)
      .scaleBy(WAD_DECIMALS)

    const receipt = await liquidate({ collateralAmountToSend, maxPrice })

    // tx was not successful
    if (receipt) {
      await refetchFIATBalance()
      setStep(3)
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
      tooltip: 'The current FIAT price at which the collateral can be liquidated.',
      value: `${data?.currentAuctionPrice?.toFixed(4)} ${FIAT_TICKER}`,
    },
    {
      title: 'Face Value',
      tooltip: 'The amount of underlying tokens available for redemption at maturity.',
      value: `$${data?.collateralFaceValue?.toFixed(4)}`,
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
      value: `${form.getFieldValue('liquidateAmount')?.toFixed()}`,
    },
    {
      title: 'Current Auction Price',
      value: `$${data?.currentAuctionPrice?.toFixed(4)} ${FIAT_TICKER}`,
    },
    {
      title: 'Buy price',
      value: `${
        form
          .getFieldValue('liquidateAmount')
          ?.multipliedBy(data?.currentAuctionPrice ?? 0)
          .toFixed(4) ?? 0
      }`,
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
                        Collateral left: ${data?.auctionedCollateral?.toFixed(2)}
                      </p>
                    </div>

                    <Form form={form} initialValues={{ liquidateAmount: 0 }} onFinish={onSubmit}>
                      <Form.Item name="liquidateAmount" required>
                        <TokenAmount
                          disabled={loading}
                          displayDecimals={4}
                          mainAsset={data?.protocol.name}
                          max={maxCredit}
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
                        onClick={() =>
                          !hasAllowance
                            ? approve()
                            : !hasMonetaAllowance
                            ? approveMoneta()
                            : form.submit()
                        }
                      >
                        {!hasAllowance
                          ? 'Set Allowance for FIAT'
                          : !hasMonetaAllowance
                          ? 'Enable Proxy for FIAT'
                          : 'Confirm'}
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

export default withRequiredConnection(LiquidateAuction)
