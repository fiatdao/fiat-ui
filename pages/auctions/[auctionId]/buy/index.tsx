import s from './s.module.scss'
import { SLIPPAGE, SUCCESS_STEP } from '@/src/constants/auctions'
import {
  FIAT_TICKER,
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
import Info from '@/src/resources/svg/info.svg'
import StepperTitle from '@/src/components/custom/stepper-title'
import Lottie from 'lottie-react'
import Link from 'next/link'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import { useMemo, useState, useEffect } from 'react'
import { Popover } from 'antd'
import { useMachine } from '@xstate/react'
import auctionFormMachine from '@/src/state/auction-form-machine'
import useUserProxy from '@/src/hooks/useUserProxy'

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
  } = useBuyCollateralForm(auctionData)
  const [FIATBalance, refetchFIATBalance] = useFIATBalance(true)
  const [isPurchaseAmountValid, setIsPurchaseAmountValid] = useState(false)
  const [amountToBuy, setAmountToBuy] = useState(ZERO_BIG_NUMBER)
  const { isProxyAvailable, loadingProxy, setupProxy, userProxyAddress } = useUserProxy()
  const [step, setStep] = useState(0)
  const [state, send] = useMachine(auctionFormMachine)

  const stepss = useMemo(() => (state.machine ? Object.keys(state.machine.states) : []), [state])
  const currentMeta = useMemo(() => state.meta[`${state.machine?.id}.${state.value}`], [state])
  const currentStateName = useMemo(() => state.value, [state])
  console.log('state: ', state)
  console.log('current state: ', currentStateName)
  // key value for current metadata is the state node's delimited full path, e.g. "machineId.stateName"
  // https://xstate.js.org/docs/guides/ids.html#identifying-state-nodes
  console.log('current meta: ', currentMeta)
  console.log('steps: ', stepss)
  console.log('steps tostrings: ', state.toStrings())

  useEffect(() => {
    // https://xstate.js.org/docs/recipes/react.html#syncing-data-with-useeffect
    send({ type: 'SET_HAS_ALLOWANCE', hasAllowance })
    send({ type: 'SET_PROXY_AVAILABLE', isProxyAvailable })
  }, [hasAllowance, isProxyAvailable, send])

  const fiatToPay = useMemo(() => {
    // TODO more closely est fiatToPay
    // 2nd try oldMaxPrice to get fiatToPay
    // const price = oldMaxPrice.unscaleBy(WAD_DECIMALS)

    const price = auctionData?.currentAuctionPrice
    return amountToBuy?.multipliedBy(price ?? ZERO_BIG_NUMBER) ?? ZERO_BIG_NUMBER
  }, [amountToBuy, auctionData?.currentAuctionPrice])

  const isFiatBalanceSufficient = useMemo(() => {
    return FIATBalance.gte(fiatToPay)
  }, [FIATBalance, fiatToPay])

  const isExecuteButtonDisabled = useMemo(() => {
    return loading || !isPurchaseAmountValid || !isFiatBalanceSufficient
  }, [loading, isPurchaseAmountValid, isFiatBalanceSufficient])

  const maxFractionalBuy = auctionData?.debt
    ?.minus(auctionData?.vault?.auctionDebtFloor ?? ZERO_BIG_NUMBER)
    .dividedBy(auctionData.currentAuctionPrice ?? ONE_BIG_NUMBER)

  const onValuesChange = ({ amountToBuy = ZERO_BIG_NUMBER }: { amountToBuy?: BigNumber }) => {
    setAmountToBuy(amountToBuy)

    if (auctionData?.debt) {
      const fiatToPay = amountToBuy.multipliedBy(auctionData.currentAuctionPrice as BigNumber)

      // DEBUG (very helpful don't delete)
      {
        /* console.log({
        auctionDebtFloor: auctionData?.vault?.auctionDebtFloor?.unscaleBy(WAD_DECIMALS).toFixed(),
        debt: auctionData.debt.unscaleBy(WAD_DECIMALS).toFixed(),
        fiatToPay: fiatToPay.toFixed(),
        remainingDebtAfterPurchase: auctionData.debt
          .unscaleBy(WAD_DECIMALS)
          .minus(fiatToPay)
          .toFixed(),
        })
      */
      }

      const remainingDebtAfterPurchase = auctionData.debt.unscaleBy(WAD_DECIMALS).minus(fiatToPay)
      const purchaseWouldPushDebtBelowFloor = remainingDebtAfterPurchase.lte(
        auctionData?.vault?.auctionDebtFloor?.unscaleBy(WAD_DECIMALS) as BigNumber,
      )

      let isBuyingAllCollateral = false
      if (auctionData?.auctionedCollateral) {
        isBuyingAllCollateral = amountToBuy.gte(auctionData.auctionedCollateral)
      }

      if (isBuyingAllCollateral) {
        setIsPurchaseAmountValid(true)
      } else if (purchaseWouldPushDebtBelowFloor) {
        // If making fractional purchase, ensure remaining debt would be <= auctionDebtFloor
        // Also handles the rare case where debt <= auctionDebtFloor
        setIsPurchaseAmountValid(false)
      } else {
        // Valid fractional purchase
        setIsPurchaseAmountValid(true)
      }
    }
  }

  useDynamicTitle(auctionData?.protocol && `Buy ${auctionData.protocol.humanReadableName}`)

  const onSubmit = async () => {
    if (!auctionData?.currentAuctionPrice) {
      console.error('unavailable auctionData')
      return
    }

    const collateralAmountToSend = form
      .getFieldValue('amountToBuy')
      .multipliedBy(SLIPPAGE.plus(1))
      .decimalPlaces(WAD_DECIMALS)
      .scaleBy(WAD_DECIMALS)

    // TODO more closely est fiatToPay
    // maybe no slippage on collateralAmountToSend will actually get est fiatToPay closer actually
    // const collateralAmountToSend = form
    //  .getFieldValue('amountToBuy')
    //  .decimalPlaces(WAD_DECIMALS)
    //  .scaleBy(WAD_DECIMALS)

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
      value: auctionData?.apy,
    },
  ]

  const summaryData = [
    {
      title: 'Estimated FIAT to pay',
      value: `${fiatToPay.toFixed(4) ?? 0} ${FIAT_TICKER}`,
    },
    {
      title: 'Remaining debt after purchase',
      value: `${auctionData?.debt
        ?.unscaleBy(WAD_DECIMALS)
        .minus(fiatToPay)
        .toFixed(4)} ${FIAT_TICKER}`,
    },
    {
      title: 'Debt floor',
      value: `${
        auctionData?.vault?.auctionDebtFloor?.unscaleBy(WAD_DECIMALS).toFixed(4) ?? 0
      } ${FIAT_TICKER}`,
    },
    {
      title: 'APY',
      value: auctionData?.apy,
    },
  ]

  if (state.value === 'success') {
    // if on final step, return success gif & summary
    return (
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
    )
  }

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
          <>
            <StepperTitle
              currentStep={state.context.stepNumber}
              description={currentMeta.description}
              title={'Buy collateral'}
              totalSteps={stepss.length}
            />
            <div className={cn(s.form)}>
              <>
                <div className={cn(s.balanceWrapper)}>
                  <h3 className={cn(s.balanceLabel)}>Purchase {auctionData?.asset}</h3>
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

                  <Popover
                    className={cn(s.buttonTextTooltip)}
                    content={
                      isExecuteButtonDisabled ? (
                        <p style={{ maxWidth: '60ch' }}>
                          The remaining debt after your purchase must be less than the debt floor to
                          ensure all outstanding debt can be recovered from liquidated collateral.
                          Learn more about auctions{' '}
                          <a href="https://docs.fiatdao.com/protocol/fiat/collateral-auctions">
                            here
                          </a>
                          .
                        </p>
                      ) : null
                    }
                  >
                    {/* hack to add tooltip to a disabled button: https://github.com/react-component/tooltip/issues/18#issuecomment-411476678 */}
                    <span style={{ cursor: isExecuteButtonDisabled ? 'not-allowed' : 'pointer' }}>
                      <div className={s.buttonsWrapper}>
                        <ButtonGradient
                          disabled={isExecuteButtonDisabled}
                          height="lg"
                          onClick={() => console.log('execute action for current step')}
                          style={isExecuteButtonDisabled ? { pointerEvents: 'none' } : {}}
                        >
                          {currentMeta.buttonText}
                        </ButtonGradient>
                        {currentStateName === 'confirmPurchase' && (
                          <button
                            className={s.backButton}
                            disabled={loading}
                            onClick={() => console.log('go back')}
                          >
                            &#8592; Go back
                          </button>
                        )}
                      </div>
                    </span>
                  </Popover>
                  <div className={cn(s.summary)}>
                    <Summary data={summaryData} />
                  </div>
                </Form>
              </>
            </div>
          </>
        </div>
      </div>
    </>
  )
}

export default withRequiredConnection(BuyCollateral)
