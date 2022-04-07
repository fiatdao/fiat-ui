import s from './s.module.scss'
import { useMachine } from '@xstate/react'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import Lottie from 'lottie-react'
import { SummaryItem } from '@/src/components/custom/summary'
import { useFIATBalance } from '@/src/hooks/useFIATBalance'
import withRequiredConnection from '@/src/hooks/RequiredConnection'
import { Form } from '@/src/components/antd'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { RadioTab, RadioTabsWrapper } from '@/src/components/antd/radio-tab'
import { ButtonBack } from '@/src/components/custom/button-back'
import { Balance } from '@/src/components/custom/balance'
import { ButtonExtraFormAction } from '@/src/components/custom/button-extra-form-action'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { FormExtraAction } from '@/src/components/custom/form-extra-action'
import { PositionFormsLayout } from '@/src/components/custom/position-forms-layout'
import { Summary } from '@/src/components/custom/summary'
import TokenAmount from '@/src/components/custom/token-amount'
import {
  BELOW_MINIMUM_AMOUNT_TEXT,
  DEPOSIT_COLLATERAL_TEXT,
  VIRTUAL_RATE,
  VIRTUAL_RATE_MAX_SLIPPAGE,
  WAD_DECIMALS,
} from '@/src/constants/misc'
import { useDynamicTitle } from '@/src/hooks/useDynamicTitle'
import { useERC20Allowance } from '@/src/hooks/useERC20Allowance'
import { useUserActions } from '@/src/hooks/useUserActions'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import stepperMachine, { TITLES_BY_STEP } from '@/src/state/open-position-form'
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

type FormProps = { tokenAmount: BigNumber; fiatAmount: BigNumber }

const FormERC20: React.FC<{
  tokenSymbol: string
  tokenAddress: string
  collateral: Collateral
}> = ({ collateral, tokenAddress, tokenSymbol }) => {
  const [form] = AntdForm.useForm<FormProps>()
  const { address: currentUserAddress, readOnlyAppProvider } = useWeb3Connection()
  const { isProxyAvailable, loadingProxy, setupProxy, userProxyAddress } = useUserProxy()
  const [loading, setLoading] = useState(false)

  const { approve, hasAllowance, loadingApprove } = useERC20Allowance(
    tokenAddress,
    userProxyAddress ?? '',
  )
  const { tokenInfo } = useTokenDecimalsAndBalance({
    tokenAddress,
    address: currentUserAddress,
    readOnlyAppProvider,
  })

  const [FIATBalance] = useFIATBalance(true)

  const { depositCollateral } = useUserActions()
  const [stateMachine, send] = useMachine(stepperMachine, {
    context: {
      isProxyAvailable,
      hasAllowance,
      tokenAddress,
      tokenSymbol,
    },
  })

  const createPosition = async ({
    erc20Amount,
    fiatAmount,
  }: {
    erc20Amount: BigNumber
    fiatAmount: BigNumber
  }): Promise<void> => {
    const _erc20Amount = erc20Amount ? getNonHumanValue(erc20Amount, WAD_DECIMALS) : ZERO_BIG_NUMBER
    const _fiatAmount = fiatAmount ? getNonHumanValue(fiatAmount, WAD_DECIMALS) : ZERO_BIG_NUMBER
    try {
      setLoading(true)
      await depositCollateral({
        vault: collateral.vault.address,
        token: tokenAddress,
        tokenId: 0,
        toDeposit: _erc20Amount,
        toMint: _fiatAmount,
      })
      setLoading(false)
    } catch (err) {
      setLoading(false)
      throw err
    }
  }

  // hasAllowance comes in false on init.
  // This useEffect change hasAllowance value on Machine
  useEffect(() => {
    send({ type: 'SET_HAS_ALLOWANCE', hasAllowance })
    send({ type: 'SET_PROXY_AVAILABLE', isProxyAvailable })
  }, [hasAllowance, isProxyAvailable, send])

  const [tab, setTab] = useState('bond')
  const [mintFiat, setMintFiat] = useState(false)

  const toggleMintFiat = () => setMintFiat(!mintFiat)

  // @TODO: not working max amount
  // maxFIAT = totalCollateral*collateralValue/collateralizationRatio/(virtualRateSafetyMargin*virtualRate)-debt
  const maxBorrowAmountCalculated = useMemo(() => {
    const totalCollateral = stateMachine.context.erc20Amount ?? ZERO_BIG_NUMBER
    const collateralValue = getHumanValue(collateral.currentValue || ONE_BIG_NUMBER, WAD_DECIMALS)
    const collateralizationRatio = getHumanValue(
      collateral.vault.collateralizationRatio || ONE_BIG_NUMBER,
      WAD_DECIMALS,
    )

    const virtualRateWithMargin = VIRTUAL_RATE_MAX_SLIPPAGE.times(VIRTUAL_RATE)
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

  const underlyingData = [
    {
      title: 'Market rate',
      value: `1 Principal Token = .9949 DAI`,
    },
    {
      title: 'Price impact',
      value: '0.00%',
    },
    {
      title: 'Slippage tolerance',
      value: '0.30%',
    },
  ]

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
      state: 'ok',
      title: 'Updated health factor',
      value: healthFactorNumber,
    },
  ]

  return (
    <>
      {stateMachine.context.currentStepNumber !== LAST_STEP ? (
        <>
          <StepperTitle
            currentStep={stateMachine.context.currentStepNumber}
            description={TITLES_BY_STEP[stateMachine.context.currentStepNumber].subtitle}
            title={TITLES_BY_STEP[stateMachine.context.currentStepNumber].title}
            totalSteps={stateMachine.context.totalStepNumber}
          />
          <div className={cn(s.form)}>
            {stateMachine.context.currentStepNumber === 1 && (
              <RadioTabsWrapper className={cn(s.radioTabsWrapper)}>
                <RadioTab checked={tab === 'bond'} onClick={() => setTab('bond')}>
                  Bond
                </RadioTab>
                {/* Temporary comment untill underlying is ready for production */}
                {/* <RadioTab
                  checked={tab === 'underlying'}
                  disabled
                  onClick={() => setTab('underlying')}
                >
                  Underlying
                </RadioTab> */}
              </RadioTabsWrapper>
            )}
            {[1, 4].includes(stateMachine.context.currentStepNumber) && tab === 'bond' && (
              <Balance
                title={`Deposit ${stateMachine.context.tokenSymbol}`}
                value={`Balance: ${tokenInfo?.humanValue?.toFixed()}`}
              />
            )}
            {tab === 'underlying' && (
              <>
                <Balance
                  title={`Swap and Deposit`}
                  value={`Balance:
              ${tokenInfo?.humanValue?.toFixed()}`}
                />
                <Form form={form} initialValues={{ underlierAmount: 0 }}>
                  <Form.Item name="underlierAmount" required>
                    <TokenAmount
                      displayDecimals={tokenInfo?.decimals}
                      mainAsset={collateral.underlierSymbol as string}
                      max={tokenInfo?.humanValue}
                      maximumFractionDigits={tokenInfo?.decimals}
                      onChange={(val) =>
                        val && send({ type: 'SET_UNDERLIER_AMOUNT', underlierAmount: val })
                      }
                      secondaryAsset={tokenSymbol}
                    />
                  </Form.Item>
                  <Summary data={underlyingData} />
                  <SummaryItem title={'Fixed APR'} value={'2%'} />
                  <SummaryItem title={'Interest earned'} value={'24.028 USDC'} />
                  <SummaryItem
                    title={'Redeemable at maturity | Dec 29 2021'}
                    value={'10,024.028 USDC'}
                  />

                  <ButtonsWrapper>
                    <ButtonGradient height="lg" onClick={() => send({ type: 'CLICK_DEPLOY' })}>
                      Deposit collateral
                    </ButtonGradient>
                  </ButtonsWrapper>
                </Form>
              </>
            )}
            {tab === 'bond' && (
              <Form form={form} initialValues={{ tokenAmount: 0, fiatAmount: 0 }}>
                {[1, 4].includes(stateMachine.context.currentStepNumber) && (
                  <Form.Item name="tokenAmount" required>
                    <TokenAmount
                      displayDecimals={tokenInfo?.decimals}
                      mainAsset={collateral.vaultName as string}
                      max={tokenInfo?.humanValue}
                      maximumFractionDigits={tokenInfo?.decimals}
                      onChange={(val) =>
                        val && send({ type: 'SET_ERC20_AMOUNT', erc20Amount: val })
                      }
                      secondaryAsset={tokenSymbol}
                      slider
                    />
                  </Form.Item>
                )}
                {stateMachine.context.currentStepNumber === 1 && (
                  <ButtonsWrapper>
                    {!isProxyAvailable && (
                      <ButtonGradient
                        height="lg"
                        onClick={() => send({ type: 'CLICK_SETUP_PROXY' })}
                      >
                        Setup Proxy
                      </ButtonGradient>
                    )}
                    {!hasAllowance && (
                      <ButtonGradient
                        disabled={!stateMachine.context.erc20Amount.gt(0) || !isProxyAvailable}
                        height="lg"
                        onClick={() => send({ type: 'CLICK_ALLOW' })}
                      >
                        {stateMachine.context.erc20Amount.gt(0)
                          ? 'Set Allowance'
                          : `Insufficient Balance for ${tokenSymbol}`}
                      </ButtonGradient>
                    )}
                  </ButtonsWrapper>
                )}
                {stateMachine.context.currentStepNumber === 2 && (
                  <ButtonsWrapper>
                    <ButtonGradient height="lg" loading={loadingProxy} onClick={setupProxy}>
                      Create Proxy
                    </ButtonGradient>
                    <button className={cn(s.backButton)} onClick={() => send({ type: 'GO_BACK' })}>
                      &#8592; Go back
                    </button>
                  </ButtonsWrapper>
                )}
                {stateMachine.context.currentStepNumber === 3 && (
                  <ButtonGradient height="lg" loading={loadingApprove} onClick={approve}>
                    {`Set Allowance for ${tokenSymbol}`}
                  </ButtonGradient>
                )}

                {stateMachine.context.currentStepNumber === 4 && (
                  <>
                    {mintFiat && (
                      <FormExtraAction
                        bottom={
                          <Form.Item name="fiatAmount" required style={{ marginBottom: 0 }}>
                            <TokenAmount
                              disabled={false}
                              displayDecimals={4}
                              healthFactorValue={healthFactorNumber}
                              max={maxBorrowAmountCalculated}
                              maximumFractionDigits={6}
                              onChange={(val) =>
                                val && send({ type: 'SET_FIAT_AMOUNT', fiatAmount: val })
                              }
                              slider="healthFactorVariant"
                              tokenIcon={<FiatIcon />}
                            />
                          </Form.Item>
                        }
                        buttonText="Mint FIAT with this transaction"
                        onClick={toggleMintFiat}
                        top={
                          <Balance
                            title={`Mint FIAT`}
                            value={`Balance: ${FIATBalance.toFixed(4)}`}
                          />
                        }
                      />
                    )}
                    <ButtonsWrapper>
                      {!mintFiat && (
                        <ButtonExtraFormAction onClick={() => toggleMintFiat()}>
                          Mint FIAT with this transaction
                        </ButtonExtraFormAction>
                      )}
                      <ButtonGradient
                        disabled={isDisabledCreatePosition()}
                        height="lg"
                        onClick={() =>
                          send({
                            type: 'CONFIRM',
                            // @ts-ignore TODO types
                            createPosition,
                          })
                        }
                      >
                        {hasMinimumFIAT ? DEPOSIT_COLLATERAL_TEXT : BELOW_MINIMUM_AMOUNT_TEXT}
                      </ButtonGradient>
                    </ButtonsWrapper>
                    <div className={cn(s.summary)}>
                      <Summary data={summaryData} />
                    </div>
                  </>
                )}
              </Form>
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
  const tokenAddress = useQueryParam('collateralId')
  useDynamicTitle(`Create Position`)
  const { data: collateral } = useCollateral(tokenAddress)

  const tokenSymbol = collateral?.symbol ?? ''
  const collateralizationRatio = collateral?.vault.collateralizationRatio ?? null
  const interestPerSecond = collateral?.vault.interestPerSecond ?? ZERO_BIG_NUMBER

  const mockedBlocks = [
    {
      title: 'Token',
      value: tokenSymbol ?? '-',
      address: tokenAddress,
      appChainId: useWeb3Connection().appChainId,
    },
    {
      title: 'Underlying Asset',
      value: collateral ? collateral.underlierSymbol : '-',
      address: collateral?.underlierAddress,
      appChainId: useWeb3Connection().appChainId,
    },
    {
      title: 'Maturity Date',
      tooltip: 'The date on which the bond is redeemable for its underlying assets.',
      value: collateral?.maturity ? parseDate(collateral?.maturity) : '-',
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
      <PositionFormsLayout infoBlocks={mockedBlocks}>
        <FormERC20
          collateral={collateral as Collateral} // TODO Fix with suspense
          tokenAddress={tokenAddress as string}
          tokenSymbol={tokenSymbol}
        />
      </PositionFormsLayout>
    </>
  )
}

export default withRequiredConnection(OpenPosition)
