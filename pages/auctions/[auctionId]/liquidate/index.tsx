import s from './s.module.scss'
import { useRouter } from 'next/router'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import { useState } from 'react'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { InfoBlock } from '@/src/components/custom/info-block'
import { BackButton } from '@/src/components/custom/back-button'
import { Form } from '@/src/components/antd'
import ElementIcon from '@/src/resources/svg/element.svg'
import genericSuspense from '@/src/utils/genericSuspense'
import TokenAmount from '@/src/components/custom/token-amount'

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

const Summary: React.FC = () => {
  const hfState = 'ok'

  return (
    <div className={s.summary}>
      <div className={s.summaryRow}>
        <div className={s.summaryTitle}>In your wallet</div>
        <div className={s.summaryValue}>5,000 DAI Principal Token</div>
      </div>
      <div className={s.summaryRow}>
        <div className={s.summaryTitle}>Depositing into position </div>
        <div className={s.summaryValue}>5,000 DAI Principal Token</div>
      </div>
      <div className={s.summaryRow}>
        <div className={s.summaryTitle}>Remaining in wallet</div>
        <div className={s.summaryValue}>0 DAI Principal Token</div>
      </div>
      <div className={s.summaryRow}>
        <div className={s.summaryTitle}>FIAT to be minted</div>
        <div className={s.summaryValue}>2,000</div>
      </div>
      <div className={s.summaryRow}>
        <div className={s.summaryTitle}>Updated health factor</div>
        <div
          className={cn(
            s.summaryValue,
            { [s.ok]: hfState === 'ok' },
            // TODO: Make these work
            // { [s.warning]: hfState === 'warning' },
            // { [s.danger]: hfState === 'danger' }
          )}
        >
          2.3
        </div>
      </div>
    </div>
  )
}

type FormProps = { liquidateAmount: BigNumber }

// TODO:
//  retrieve price with `getStatus`
//  `maxPrice` must be less than `price`
//  setAllowance and call takeCollateral from collateralAuction contract
const LiquidateAuction = () => {
  const {
    query: { auctionId },
  } = useRouter()

  console.log({ auctionId })

  const [form] = AntdForm.useForm<FormProps>()
  const [step, setStep] = useState(1)

  const mockedBlocks = [
    {
      title: 'Up for Auction',
      tooltip: 'Tooltip text',
      value: '20,000',
    },
    {
      title: 'Auction Price',
      tooltip: 'Tooltip text',
      value: '$150.00',
    },
    {
      title: 'Current Value',
      tooltip: 'Tooltip text',
      value: '$250.00',
    },
    {
      title: 'Profit',
      tooltip: 'Tooltip text',
      value: '5.33%',
    },
  ]

  return (
    <>
      <BackButton href="/auctions">Back</BackButton>
      <div className={cn(s.mainContainer)}>
        <div className={cn(s.infoBlocks)}>
          {mockedBlocks.map((item, index) => (
            <InfoBlock
              key={`${index}_info`}
              title={item.title}
              tooltip={item.tooltip || ''}
              value={item.value}
            />
          ))}
        </div>

        <div className={cn(s.formWrapper)}>
          <StepperTitle
            currentStep={step}
            description={'Select the amount to be liquidated'}
            title={'Liquidate a position'}
            totalSteps={2}
          />
          <div className={cn(s.form)}>
            {step === 1 && (
              <>
                <div className={cn(s.balanceWrapper)}>
                  <h3 className={cn(s.balanceLabel)}>Select amount</h3>
                  <p className={cn(s.balance)}>Available: 10.000</p>
                </div>

                <Form form={form} initialValues={{ liquidateAmount: 0 }}>
                  <Form.Item name="liquidateAmount" required>
                    <TokenAmount
                      displayDecimals={4}
                      max={10000}
                      maximumFractionDigits={6}
                      onChange={(val) => val}
                      slider
                      tokenIcon={<ElementIcon />}
                    />
                  </Form.Item>
                  <ButtonGradient disabled={false} height="lg" onClick={() => setStep(2)}>
                    Liquidate
                  </ButtonGradient>
                </Form>
              </>
            )}
            {step === 2 && (
              <>
                <Summary />
                <div className={s.buttonsWrapper}>
                  <ButtonGradient height="lg" onClick={() => console.log('confirm liquidity')}>
                    Confirm
                  </ButtonGradient>
                  <button className={s.backButton} onClick={() => setStep(1)}>
                    &#8592; Go back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default genericSuspense(LiquidateAuction)
