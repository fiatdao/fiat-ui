import s from './s.module.scss'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useTokenSymbol } from '@/src/hooks/contracts/useTokenSymbol'
import { useERC20Allowance } from '@/src/hooks/useERC20Allowance'
import contractCall from '@/src/utils/contractCall'
import { contracts } from '@/src/constants/contracts'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { getNonHumanValue } from '@/src/web3/utils'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { useAuctionData } from '@/src/hooks/useAuctionData'
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
  const [sendingForm, setSendingForm] = useState(false)

  const {
    address: currentUserAddress,
    appChainId,
    isAppConnected,
    readOnlyAppProvider,
    web3Provider,
  } = useWeb3Connection()

  const provider = isAppConnected && web3Provider ? web3Provider.getSigner() : readOnlyAppProvider

  const { data, loading } = useAuctionData(auctionId as string)

  const { approve, hasAllowance, loadingApprove } = useERC20Allowance(
    data?.tokenAddress as string,
    currentUserAddress as string,
  )

  const { tokenSymbol } = useTokenSymbol(data?.tokenAddress as string)

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

  useEffect(() => {
    if (loadingApprove) {
      setSendingForm(true)
    } else {
      setSendingForm(false)
    }
  }, [loadingApprove])

  const onSubmit = async () => {
    if (!hasAllowance) {
      await approve()
    } else {
      setSendingForm(true)

      const collateralAmountToSend = getNonHumanValue(
        form.getFieldValue('liquidateAmount'),
        18,
      ).toFixed()

      console.log(collateralAmountToSend)

      contractCall(
        contracts.COLLATERAL_AUCTION.address[appChainId],
        contracts.COLLATERAL_AUCTION.abi,
        provider,
        'takeCollateral',
        [
          auctionId,
          collateralAmountToSend,
          ZERO_BIG_NUMBER.toFixed(),
          currentUserAddress,
          [],
          {
            gasLimit: 10_000_000,
          },
        ],
      )
        .then(() => {
          setSendingForm(false)
        })
        .catch((err) => console.log(err))
    }
  }

  if (loading) return <p>Loading...</p>

  return (
    <>
      <BackButton href="/auctions">Back</BackButton>
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
                  <p className={cn(s.balance)}>Collateral left: ${data?.collateralToSell}</p>
                </div>

                <Form form={form} initialValues={{ liquidateAmount: 0 }} onFinish={onSubmit}>
                  <Form.Item name="liquidateAmount" required>
                    <TokenAmount
                      disabled={sendingForm}
                      displayDecimals={4}
                      max={Number(data?.collateralToSell)}
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
                  <ButtonGradient height="lg" loading={sendingForm} onClick={form.submit}>
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

export default genericSuspense(LiquidateAuction)
