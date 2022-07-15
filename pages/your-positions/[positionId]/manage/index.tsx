import s from './s.module.scss'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { Position } from '@/src/utils/data/positions'
import { Collateral } from '@/src/utils/data/collaterals'
import { PositionFormsLayout } from '@/src/components/custom/position-forms-layout'
import { Form } from '@/src/components/antd'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { Tab, Tabs, TokenAmount } from '@/src/components/custom'
import { Balance } from '@/src/components/custom/balance'
import { ButtonBack } from '@/src/components/custom/button-back'
import { RadioTab, RadioTabsWrapper } from '@/src/components/antd/radio-tab'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { Summary } from '@/src/components/custom/summary'
import { contracts } from '@/src/constants/contracts'
import {
  ONE_BIG_NUMBER,
  SET_FIAT_ALLOWANCE_PROXY_TEXT,
  ZERO_BIG_NUMBER,
} from '@/src/constants/misc'
import {
  useManageFormSummary,
  useManagePositionForm,
  useManagePositionInfo,
  useManagePositionsInfoBlock,
} from '@/src/hooks/managePosition'
import withRequiredConnection from '@/src/hooks/RequiredConnection'
import { useDynamicTitle } from '@/src/hooks/useDynamicTitle'
import { useFIATBalance } from '@/src/hooks/useFIATBalance'
import SuccessAnimation from '@/src/resources/animations/success-animation.json'
import { useCollateral } from '@/src/hooks/subgraph/useCollateral'
import SwapSettingsModal from '@/src/components/custom/swap-settings-modal'
import { getUnderlyingDataSummary } from '@/src/utils/underlyingPositionHelpers'
import { getHumanValue, getNonHumanValue } from '@/src/web3/utils'
import { useUnderlierToFCash } from '@/src/hooks/underlierToFCash'
import { getDecimalsFromScale } from '@/src/constants/bondTokens'
import { useUnderlyingExchangeValue } from '@/src/hooks/useUnderlyingExchangeValue'
import cn from 'classnames'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import Lottie from 'lottie-react'
import Link from 'next/link'
import { SettingFilled } from '@ant-design/icons'

const LAST_STEP = 4

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

type Step = {
  id: number
  description: string
}

const FIAT_KEYS = ['borrow', 'repay'] as const
export type FiatTabKey = typeof FIAT_KEYS[number]

export const isFiatTab = (key: string): key is FiatTabKey => {
  return FIAT_KEYS.includes(key as FiatTabKey)
}

const COLLATERAL_KEYS = [
  'deposit',
  'withdraw',
  'underlierWithdrawAmount',
  'underlierDepositAmount',
] as const
export type CollateralTabKey = typeof COLLATERAL_KEYS[number]

export const isCollateralTab = (key: string): key is CollateralTabKey => {
  return COLLATERAL_KEYS.includes(key as CollateralTabKey)
}

export type PositionManageFormFields = {
  borrow: BigNumber | undefined
  deposit: BigNumber | undefined
  underlierDepositAmount: BigNumber | undefined
  repay: BigNumber | undefined
  withdraw: BigNumber | undefined
  underlierWithdrawAmount: BigNumber | undefined
}

const defaultManageFormFields = {
  repay: undefined,
  borrow: undefined,
  withdraw: undefined,
  underlierWithdrawAmount: undefined,
  deposit: undefined,
  underlierDepositAmount: undefined,
}

const PositionManage = () => {
  useDynamicTitle(`Manage Position`)
  const [form] = AntdForm.useForm<PositionManageFormFields>()
  const [activeSection, setActiveSection] = useState<'collateral' | 'fiat'>('collateral')
  const [swapSettingsOpen, setSwapSettingsOpen] = useState(false)
  const [slippageTolerance, setSlippageTolerance] = useState(0.1)
  const [maxTransactionTime, setMaxTransactionTime] = useState(20)
  const [activeTabKey, setActiveTabKey] = useState<FiatTabKey | CollateralTabKey>('deposit')
  const [formDisabled, setFormDisabled] = useState(false)
  const [fiatBalance, refetchFiatBalance] = useFIATBalance(true)
  const { position, refetch: refetchPosition } = useManagePositionInfo()
  // collateral id is compound id of <vaultAddress>-<tokenId>
  const { data: collateral } = useCollateral(`${position?.protocolAddress}-${position?.tokenId}`)
  const infoBlocks = useManagePositionsInfoBlock(position as Position)
  const formValues = form.getFieldsValue(true) as PositionManageFormFields

  const onSuccess = async () => {
    form.resetFields()
    await Promise.all([refetchPosition(), refetchFiatBalance()])
  }

  const {
    approveFiatAllowance,
    approveMonetaAllowance,
    approveTokenAllowance,
    availableDepositAmount,
    availableUnderlierDepositAmount,
    availableUnderlierWithdrawAmount,
    availableWithdrawAmount,
    buttonText,
    finished,
    handleFormChange,
    handleManage,
    hasFiatAllowance,
    hasMonetaAllowance,
    hasTokenAllowance,
    healthFactor,
    isDisabledCreatePosition,
    isLoading,
    isProxyAvailable,
    isRepayingFIAT,
    loadingFiatAllowanceApprove,
    loadingMonetaAllowanceApprove,
    loadingProxy,
    loadingTokenAllowanceApprove,
    maxBorrowAmount,
    maxDepositAmount,
    maxRepayAmount,
    maxUnderlierDepositAmount,
    maxUnderlierWithdrawAmount,
    maxWithdrawAmount,
    setFinished,
    setupProxy,
  } = useManagePositionForm(
    position as Position,
    collateral as Collateral,
    formValues,
    activeTabKey,
    slippageTolerance,
    maxTransactionTime,
    onSuccess,
  )

  const underlierDecimals = useMemo(
    () => (collateral ? getDecimalsFromScale(collateral.underlierScale) : 0),
    [collateral],
  )

  const [underlierToPToken] = useUnderlyingExchangeValue({
    vault: collateral?.vault?.address ?? '',
    balancerVault: collateral?.eptData?.balancerVault ?? '',
    curvePoolId: collateral?.eptData?.poolId ?? '',
    underlierAmount: getNonHumanValue(ONE_BIG_NUMBER, underlierDecimals), //single underlier value
  })

  const bondSummary = useManageFormSummary(position as Position, formValues)

  const [underlierToFCash] = useUnderlierToFCash({
    tokenId: collateral?.tokenId ?? '',
    amount: getNonHumanValue(ONE_BIG_NUMBER, underlierDecimals), //single underlier value
  })

  const maxRepay = BigNumber.min(maxRepayAmount ?? ZERO_BIG_NUMBER, fiatBalance)
  const tokenSymbol = position?.symbol ?? ''

  const reset = async () => {
    setFinished(false)
  }
  const [step, setStep] = useState(0)
  const steps: Step[] = [
    {
      id: 1,
      description: 'Create a Proxy Contract',
    },
    {
      id: 2,
      description: 'Set Collateral Allowance',
    },
    {
      id: 3,
      description: 'Set Allowance for FIAT',
    },
    {
      id: 4,
      description: 'Enable Proxy for FIAT',
    },
    {
      id: 5,
      description: 'Confirm the Details',
    },
  ]

  const updateNextState = useCallback(
    (state: number) => {
      if (state <= 0 && !isProxyAvailable) {
        setStep(0)
      } else if (state <= 1 && !hasTokenAllowance) {
        setStep(1)
      } else if (state <= 2 && !hasFiatAllowance && isRepayingFIAT) {
        setStep(2)
      } else if (state <= 3 && !hasMonetaAllowance && isRepayingFIAT) {
        setStep(3)
      } else {
        setStep(4)
      }
    },
    [hasMonetaAllowance, isRepayingFIAT, hasFiatAllowance, hasTokenAllowance, isProxyAvailable],
  )

  const onSetupProxy = useCallback(async () => {
    await setupProxy()
    updateNextState(1)
  }, [setupProxy, updateNextState])

  const onApproveTokenAllowance = useCallback(async () => {
    await approveTokenAllowance()
    updateNextState(2)
  }, [approveTokenAllowance, updateNextState])

  const onApproveFiatAllowance = useCallback(async () => {
    await approveFiatAllowance()
    updateNextState(3)
  }, [approveFiatAllowance, updateNextState])

  const onApproveMonetaAllowance = useCallback(async () => {
    await approveMonetaAllowance()
    updateNextState(4)
  }, [approveMonetaAllowance, updateNextState])

  const onHandleManage = useCallback(async () => {
    setFormDisabled(true)
    handleManage(formValues)
      .then(() => {
        setFormDisabled(false)
      })
      .catch(() => {
        setFormDisabled(false)
      })
  }, [handleManage, formValues])

  const updateSwapSettings = useCallback(
    (slippageTolerance: number, maxTransactionTime: number) => {
      setSlippageTolerance(slippageTolerance ?? 0)
      setMaxTransactionTime(maxTransactionTime ?? 0)
    },
    [],
  )

  const marketRate = useMemo(
    () =>
      collateral?.vault.type === 'NOTIONAL'
        ? ONE_BIG_NUMBER.div(getHumanValue(underlierToFCash, 77)) // Why is this number 77? This is what I currently have to use based on what Im recieving from the contract call but this doesnt seem right
        : ONE_BIG_NUMBER.div(getHumanValue(underlierToPToken, underlierDecimals)),
    [collateral?.vault.type, underlierDecimals, underlierToFCash, underlierToPToken],
  )

  const depositUnderlierSummary = collateral
    ? getUnderlyingDataSummary(
        marketRate,
        slippageTolerance,
        collateral,
        form.getFieldValue('underlierDepositAmount') ?? ZERO_BIG_NUMBER,
      )
    : []

  const withdrawUnderlierSummary = collateral
    ? getUnderlyingDataSummary(
        marketRate,
        slippageTolerance,
        collateral,
        form.getFieldValue('underlierWithdrawAmount') ?? ZERO_BIG_NUMBER,
      )
    : []

  const enableButtons = useMemo(
    () =>
      !isProxyAvailable ||
      !hasTokenAllowance ||
      (!hasFiatAllowance && isRepayingFIAT) ||
      (!hasMonetaAllowance && isRepayingFIAT),
    [hasFiatAllowance, hasTokenAllowance, hasMonetaAllowance, isProxyAvailable, isRepayingFIAT],
  )

  const isMatured = useMemo(
    () => position?.maturity.getTime() && position?.maturity.getTime() < Date.now(),
    [position],
  )

  const shouldRenderCollateralTabs = useMemo(
    () => 'collateral' === activeSection && isCollateralTab(activeTabKey),
    [activeSection, activeTabKey],
  )

  useEffect(() => {
    // initialize step to 0
    updateNextState(0)
  }, [updateNextState])

  useEffect(() => {
    // if switching to tab and no subtab is selected, select first tab in the section that makes sense that
    setActiveTabKey(activeSection === 'collateral' ? 'deposit' : 'borrow')
  }, [activeSection])

  useEffect(() => {
    if (activeSection === 'collateral') {
      if (isMatured && activeTabKey !== 'withdraw' && activeTabKey !== 'underlierWithdrawAmount') {
        setActiveTabKey('withdraw')
      }
    }
  }, [activeSection, activeTabKey, isMatured])

  const getMaturedFCashMessage = useCallback((): string | null => {
    if (position?.protocol === 'Notional Finance' && isMatured) {
      return 'Note: This fCash has matured; you will receive the underlying asset'
    }
    return null
  }, [position, isMatured])

  const SuccessPage = () => {
    return (
      <div className={cn(s.form)}>
        <div className={cn(s.lastStepAnimation)}>
          <Lottie animationData={SuccessAnimation} autoplay loop />
        </div>
        <h1 className={cn(s.lastStepTitle)}>Congrats!</h1>
        <p className={cn(s.lastStepText)}>
          Your position has been successfully updated! It may take a couple seconds for your
          position to show in the app.
        </p>
        <div className={cn(s.summary)}>
          <ButtonsWrapper>
            <ButtonGradient height="lg" onClick={reset}>
              Continue
            </ButtonGradient>
            <Link href={`/your-positions/`} passHref>
              <button className={cn(s.finishButton)}>Go to Your Positions</button>
            </Link>
          </ButtonsWrapper>
        </div>
      </div>
    )
  }

  const TopTabs = () => (
    <div className={cn(s.top)}>
      <RadioTabsWrapper>
        <RadioTab
          checked={activeSection === 'collateral'}
          disabled={formDisabled}
          onClick={() => setActiveSection('collateral')}
        >
          Collateral
        </RadioTab>
        <RadioTab
          checked={activeSection === 'fiat'}
          disabled={formDisabled}
          onClick={() => setActiveSection('fiat')}
        >
          FIAT
        </RadioTab>
      </RadioTabsWrapper>
    </div>
  )

  return (
    <>
      <SwapSettingsModal
        isOpen={swapSettingsOpen}
        maxTransactionTime={maxTransactionTime}
        slippageTolerance={slippageTolerance}
        toggleOpen={() => setSwapSettingsOpen(!swapSettingsOpen)}
        updateSwapSettings={updateSwapSettings}
      />
      <ButtonBack href="/your-positions">Back</ButtonBack>
      <PositionFormsLayout infoBlocks={infoBlocks}>
        {finished ? (
          <SuccessPage />
        ) : (
          <>
            <StepperTitle
              currentStep={step + 1}
              description={steps[step].description}
              title={'Manage your position'}
              totalSteps={steps.length}
            />
            <TopTabs />
            <Form form={form} onValuesChange={handleFormChange}>
              <fieldset>
                <div className={cn(s.component)}>
                  {shouldRenderCollateralTabs ? (
                    <>
                      <Tabs className={cn(s.tabs)}>
                        {!isMatured && (
                          <>
                            <Tab
                              isActive={'deposit' === activeTabKey}
                              onClick={() => {
                                form.setFieldsValue({
                                  ...defaultManageFormFields,
                                  deposit: form.getFieldValue('deposit'),
                                  // maintain fiat tab values
                                  borrow: form.getFieldValue('borrow'),
                                  repay: form.getFieldValue('repay'),
                                })
                                setActiveTabKey('deposit')
                              }}
                            >
                              Deposit
                            </Tab>
                            <Tab
                              isActive={'underlierDepositAmount' === activeTabKey}
                              onClick={() => {
                                form.setFieldsValue({
                                  ...defaultManageFormFields,
                                  underlierDepositAmount:
                                    form.getFieldValue('underlierDepositAmount'),
                                  // maintain fiat tab values
                                  borrow: form.getFieldValue('borrow'),
                                  repay: form.getFieldValue('repay'),
                                })
                                setActiveTabKey('underlierDepositAmount')
                              }}
                            >
                              Deposit Underlier
                            </Tab>
                          </>
                        )}
                        <Tab
                          isActive={'withdraw' === activeTabKey}
                          onClick={() => {
                            form.setFieldsValue({
                              ...defaultManageFormFields,
                              withdraw: form.getFieldValue('withdraw'),
                              // maintain fiat tab values
                              borrow: form.getFieldValue('borrow'),
                              repay: form.getFieldValue('repay'),
                            })
                            setActiveTabKey('withdraw')
                          }}
                        >
                          Withdraw
                        </Tab>
                        <Tab
                          isActive={'underlierWithdrawAmount' === activeTabKey}
                          onClick={() => {
                            form.setFieldsValue({
                              ...defaultManageFormFields,
                              underlierWithdrawAmount:
                                form.getFieldValue('underlierWithdrawAmount'),
                              // maintain fiat tab values
                              borrow: form.getFieldValue('borrow'),
                              repay: form.getFieldValue('repay'),
                            })
                            setActiveTabKey('underlierWithdrawAmount')
                          }}
                        >
                          Withdraw Underlier
                        </Tab>
                      </Tabs>
                      {'deposit' === activeTabKey && position && (
                        <>
                          <Balance
                            title="Select amount to deposit"
                            value={`Available: ${availableDepositAmount?.toFixed(2)}`}
                          />
                          <Form.Item name="deposit" required>
                            <TokenAmount
                              displayDecimals={4}
                              healthFactorValue={healthFactor}
                              mainAsset={position.vaultName}
                              max={maxDepositAmount}
                              maximumFractionDigits={4}
                              numericInputDisabled={formDisabled}
                              secondaryAsset={position.underlier.symbol}
                              slider={'healthFactorVariantReverse'}
                              sliderDisabled={formDisabled}
                            />
                          </Form.Item>
                        </>
                      )}
                      {'underlierDepositAmount' === activeTabKey && position && (
                        <>
                          <div className={cn(s.balanceContainer)}>
                            <Balance
                              title="Swap and deposit"
                              value={`Available: ${availableUnderlierDepositAmount?.toFixed(2)}`}
                            />
                            <SettingFilled
                              className={cn(s.settings)}
                              onClick={() => setSwapSettingsOpen(!swapSettingsOpen)}
                            />
                          </div>
                          <Form.Item name="underlierDepositAmount" required>
                            <TokenAmount
                              displayDecimals={4}
                              healthFactorValue={healthFactor}
                              mainAsset={position.vaultName}
                              max={maxUnderlierDepositAmount}
                              maximumFractionDigits={4}
                              numericInputDisabled={formDisabled}
                              secondaryAsset={position.underlier.symbol}
                              slider={'healthFactorVariantReverse'}
                              sliderDisabled={formDisabled}
                            />
                          </Form.Item>
                        </>
                      )}
                      {'withdraw' === activeTabKey && position && (
                        <>
                          <Balance
                            description={getMaturedFCashMessage()}
                            title={'Select amount to withdraw'}
                            value={`Available: ${availableWithdrawAmount?.toFixed(2)}`}
                          />
                          <Form.Item name="withdraw" required>
                            <TokenAmount
                              displayDecimals={4}
                              healthFactorValue={healthFactor}
                              mainAsset={position.vaultName}
                              max={maxWithdrawAmount}
                              maximumFractionDigits={4}
                              numericInputDisabled={formDisabled}
                              secondaryAsset={position.underlier.symbol}
                              slider={'healthFactorVariant'}
                              sliderDisabled={formDisabled}
                            />
                          </Form.Item>
                        </>
                      )}
                      {'underlierWithdrawAmount' === activeTabKey && position && (
                        <>
                          <div className={cn(s.balanceContainer)}>
                            <Balance
                              title="Select amount of underlier to withdraw"
                              value={`Available: ${availableUnderlierWithdrawAmount?.toFixed(2)}`}
                            />
                            <SettingFilled
                              className={cn(s.settings)}
                              onClick={() => setSwapSettingsOpen(!swapSettingsOpen)}
                            />
                          </div>
                          <Form.Item name="underlierWithdrawAmount" required>
                            <TokenAmount
                              displayDecimals={4}
                              healthFactorValue={healthFactor}
                              mainAsset={position.vaultName}
                              max={maxUnderlierWithdrawAmount}
                              maximumFractionDigits={4}
                              numericInputDisabled={formDisabled}
                              secondaryAsset={position.underlier.symbol}
                              slider={'healthFactorVariant'}
                              sliderDisabled={formDisabled}
                            />
                          </Form.Item>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <Tabs className={cn(s.tabs)}>
                        <Tab
                          isActive={'borrow' === activeTabKey}
                          onClick={() => {
                            form.setFieldsValue({
                              // leave collateral tabs untouched, reset other fiat subtab
                              repay: undefined,
                            })
                            setActiveTabKey('borrow')
                          }}
                        >
                          Borrow
                        </Tab>
                        <Tab
                          isActive={'repay' === activeTabKey}
                          onClick={() => {
                            form.setFieldsValue({
                              // leave collateral tabs untouched, reset other fiat subtab
                              borrow: undefined,
                            })
                            setActiveTabKey('repay')
                          }}
                        >
                          Repay
                        </Tab>
                      </Tabs>
                      {'borrow' === activeTabKey && position && (
                        <>
                          <Balance
                            title="Select amount to borrow"
                            value={`Available: ${fiatBalance?.toFixed(2)}`}
                          />
                          <Form.Item name="borrow" required>
                            <TokenAmount
                              displayDecimals={contracts.FIAT.decimals}
                              healthFactorValue={healthFactor}
                              max={maxBorrowAmount}
                              maximumFractionDigits={contracts.FIAT.decimals}
                              numericInputDisabled={formDisabled}
                              slider={'healthFactorVariant'}
                              sliderDisabled={formDisabled}
                              tokenIcon={<FiatIcon />}
                            />
                          </Form.Item>
                        </>
                      )}
                      {'repay' === activeTabKey && position && (
                        <>
                          <Balance
                            title="Select amount to repay"
                            value={`Available: ${fiatBalance?.toFixed(2)}`}
                          />
                          <Form.Item name="repay" required>
                            <TokenAmount
                              displayDecimals={contracts.FIAT.decimals}
                              healthFactorValue={healthFactor}
                              max={maxRepay}
                              maximumFractionDigits={contracts.FIAT.decimals}
                              numericInputDisabled={formDisabled}
                              slider={'healthFactorVariantReverse'}
                              sliderDisabled={formDisabled}
                              tokenIcon={<FiatIcon />}
                            />
                          </Form.Item>
                        </>
                      )}
                    </>
                  )}
                  {enableButtons && (
                    <ButtonsWrapper>
                      {!isProxyAvailable && (
                        <ButtonGradient disabled={loadingProxy} height="lg" onClick={onSetupProxy}>
                          Setup Proxy
                        </ButtonGradient>
                      )}
                      {!hasTokenAllowance && (
                        <ButtonGradient
                          disabled={
                            (availableDepositAmount && availableDepositAmount.lte(0)) ||
                            loadingTokenAllowanceApprove
                          }
                          height="lg"
                          onClick={onApproveTokenAllowance}
                        >
                          {availableDepositAmount?.gt(0)
                            ? 'Set Allowance'
                            : `Insufficient Balance for ${tokenSymbol}`}
                        </ButtonGradient>
                      )}
                      {!hasFiatAllowance && isRepayingFIAT && (
                        <ButtonGradient
                          disabled={loadingFiatAllowanceApprove}
                          height="lg"
                          onClick={onApproveFiatAllowance}
                        >
                          {SET_FIAT_ALLOWANCE_PROXY_TEXT}
                        </ButtonGradient>
                      )}
                      {hasFiatAllowance && !hasMonetaAllowance && isRepayingFIAT && (
                        <ButtonGradient
                          disabled={loadingMonetaAllowanceApprove}
                          height="lg"
                          onClick={onApproveMonetaAllowance}
                        >
                          Enable Proxy for FIAT
                        </ButtonGradient>
                      )}
                    </ButtonsWrapper>
                  )}
                  {step === LAST_STEP && (
                    <ButtonsWrapper>
                      <ButtonGradient
                        disabled={isLoading || isDisabledCreatePosition}
                        height="lg"
                        onClick={onHandleManage}
                      >
                        {buttonText}
                      </ButtonGradient>
                    </ButtonsWrapper>
                  )}
                  <div className={cn(s.summary)}>
                    {activeTabKey === 'underlierDepositAmount' ? (
                      <Summary data={depositUnderlierSummary} />
                    ) : activeTabKey === 'underlierWithdrawAmount' ? (
                      <Summary data={withdrawUnderlierSummary} />
                    ) : (
                      <Summary data={bondSummary} />
                    )}
                  </div>
                </div>
              </fieldset>
            </Form>
          </>
        )}
      </PositionFormsLayout>
    </>
  )
}

export default withRequiredConnection(PositionManage)
