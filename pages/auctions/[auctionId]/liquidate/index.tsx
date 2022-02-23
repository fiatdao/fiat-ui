import s from './s.module.scss'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import { useEffect, useState } from 'react'
import withRequiredConnection from '@/src/hooks/RequiredConnection'
import { useFIATBalance } from '@/src/hooks/useFIATBalance'
import { useDynamicTitle } from '@/src/hooks/useDynamicTitle'
import { useAuction } from '@/src/hooks/subgraph/useAuction'
import useTransaction from '@/src/hooks/contracts/useTransaction'
import { useQueryParam } from '@/src/hooks/useQueryParam'
import { useTokenSymbol } from '@/src/hooks/contracts/useTokenSymbol'
import { useERC20Allowance } from '@/src/hooks/useERC20Allowance'
import { contracts } from '@/src/constants/contracts'
import { getNonHumanValue } from '@/src/web3/utils'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { InfoBlock } from '@/src/components/custom/info-block'
import { ButtonBack } from '@/src/components/custom/button-back'
import { Form } from '@/src/components/antd'
import ElementIcon from '@/src/resources/svg/element.svg'
import TokenAmount from '@/src/components/custom/token-amount'

const SLIPPAGE_VALUE = BigNumber.from(0.02) // 2%

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
  return (
    <div className={s.summary}>
      <div className={s.summaryRow}>
        <div className={s.summaryTitle}>Amount</div>
        <div className={s.summaryValue}>5,000 DAI Principal Token</div>
      </div>
      <div className={s.summaryRow}>
        <div className={s.summaryTitle}>Current price</div>
        <div className={s.summaryValue}>5,000 DAI Principal Token</div>
      </div>
      <div className={s.summaryRow}>
        <div className={s.summaryTitle}>Total value</div>
        <div className={s.summaryValue}>0 DAI Principal Token</div>
      </div>
    </div>
  )
}

type FormProps = { liquidateAmount: BigNumber }

const LiquidateAuction = () => {
  const auctionId = useQueryParam('auctionId')

  const [form] = AntdForm.useForm<FormProps>()
  const [step, setStep] = useState(1)
  const [sendingForm, setSendingForm] = useState(false)

  const { address: currentUserAddress } = useWeb3Connection()

  const { data } = useAuction(auctionId as string)

  const { approve, hasAllowance, loadingApprove } = useERC20Allowance(
    data?.tokenAddress as string,
    currentUserAddress as string,
  )

  const { tokenSymbol } = useTokenSymbol(data?.tokenAddress as string)

  useDynamicTitle(tokenSymbol && `Liquidate ${tokenSymbol} position`)

  const [FIATBalance, refetchFIATBalance] = useFIATBalance()

  const takeCollateralTx = useTransaction(contracts.COLLATERAL_AUCTION, 'takeCollateral')

  useEffect(() => {
    setSendingForm(loadingApprove)
  }, [loadingApprove])

  const onSubmit = () => {
    setSendingForm(true)

    // TODO SUM slippage fixed value
    const collateralAmountToSend = getNonHumanValue(
      form.getFieldValue('liquidateAmount').multipliedBy(SLIPPAGE_VALUE.plus(BigNumber.from(1))),
      18,
    )

    // maxPrice parameter calc TODO must be in USD?
    const maxPrice = getNonHumanValue(FIATBalance.dividedBy(collateralAmountToSend), 18).toFixed(0)

    takeCollateralTx(
      auctionId,
      collateralAmountToSend.toFixed(),
      maxPrice,
      currentUserAddress,
      [],
      {
        gasLimit: 10_000_000, //TODO this gasLimit is OK?
      },
    )
      .then(async () => {
        await refetchFIATBalance()
        setSendingForm(false)
      })
      .catch((err) => {
        console.log(err)
        setSendingForm(false)
      })
  }

  const blocksData = [
    {
      title: 'Up for Auction',
      tooltip: 'Tooltip text', // TODO tooltip text?
      value: data?.upForAuction || undefined,
    },
    {
      title: 'Auction Price',
      tooltip: 'Tooltip text', // TODO tooltip text?
      value: `$${data?.price}`,
    },
    {
      title: 'Collateral Value',
      tooltip: 'Tooltip text', // TODO tooltip text?
      value: `$${data?.collateralValue}`,
    },
    {
      title: 'Profit',
      tooltip: 'Tooltip text', // TODO tooltip text?
      value: `${data?.profit}%`,
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
          <StepperTitle
            currentStep={step}
            description={step === 1 ? 'Select the amount to be liquidated' : 'Confirm the details'}
            title={'Liquidate a position'}
            totalSteps={2}
          />
          <div className={cn(s.form)}>
            {step === 1 && (
              <>
                <div className={cn(s.balanceWrapper)}>
                  <h3 className={cn(s.balanceLabel)}>Select amount</h3>
                  <p className={cn(s.balance)}>Collateral left: ${Number(data?.upForAuction)}</p>
                </div>

                <Form form={form} initialValues={{ liquidateAmount: 0 }} onFinish={onSubmit}>
                  <Form.Item name="liquidateAmount" required>
                    <TokenAmount
                      disabled={sendingForm}
                      displayDecimals={4}
                      max={Number(data?.upForAuction)}
                      maximumFractionDigits={6}
                      slider
                      tokenIcon={<ElementIcon />}
                    />
                  </Form.Item>
                  <ButtonGradient disabled={sendingForm} height="lg" onClick={() => setStep(2)}>
                    Liquidate
                  </ButtonGradient>
                </Form>
              </>
            )}
            {step === 2 && (
              <>
                <Summary />
                <div className={s.buttonsWrapper}>
                  <ButtonGradient
                    height="lg"
                    loading={sendingForm}
                    onClick={() => (hasAllowance ? form.submit() : approve())}
                  >
                    {hasAllowance ? 'Confirm' : `Set Allowance for ${tokenSymbol}`}
                  </ButtonGradient>
                  <button
                    className={s.backButton}
                    disabled={sendingForm}
                    onClick={() => setStep(1)}
                  >
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

export default withRequiredConnection(LiquidateAuction)
