import s from './s.module.scss'
import { useTokenDecimalsAndBalance } from '../../../../src/hooks/useTokenDecimalsAndBalance'
import { useWeb3Connection } from '../../../../src/providers/web3ConnectionProvider'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { Position } from '@/src/utils/data/positions'
import { PositionFormsLayout } from '@/src/components/custom/position-forms-layout'
import { Form } from '@/src/components/antd'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { Tab, Tabs, TokenAmount } from '@/src/components/custom'
import { Balance } from '@/src/components/custom/balance'
import { ButtonBack } from '@/src/components/custom/button-back'
import { RadioTab, RadioTabsWrapper } from '@/src/components/antd/radio-tab'

import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { SummaryItem } from '@/src/components/custom/summary'
import { contracts } from '@/src/constants/contracts'
import { SET_FIAT_ALLOWANCE_PROXY_TEXT, ZERO_BIG_NUMBER } from '@/src/constants/misc'
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
import cn from 'classnames'
import React, { useCallback, useEffect, useState } from 'react'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import Lottie from 'lottie-react'
import Link from 'next/link'
import { send } from 'xstate'

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

const COLLATERAL_KEYS = ['deposit', 'withdraw', 'withdrawUnderlier', 'depositUnderlier'] as const
export type CollateralTabKey = typeof COLLATERAL_KEYS[number]

export const isCollateralTab = (key: string): key is CollateralTabKey => {
  return COLLATERAL_KEYS.includes(key as CollateralTabKey)
}

export type PositionManageFormFields = {
  repay: BigNumber
  withdraw: BigNumber
  borrow: BigNumber
  deposit: BigNumber
}

/* const defaultManageFormFields = { */
/*   repay: ZERO_BIG_NUMBER, */
/*   borrow: ZERO_BIG_NUMBER, */
/*   withdraw: ZERO_BIG_NUMBER, */
/*   withdrawUnderlier: ZERO_BIG_NUMBER, */
/*   deposit: ZERO_BIG_NUMBER, */
/*   depositUnderlier: ZERO_BIG_NUMBER, */
/* } */

const PositionManage = () => {
  const [form] = AntdForm.useForm<PositionManageFormFields>()
  const [activeSection, setActiveSection] = useState<'collateral' | 'fiat'>('collateral')
  const [activeTabKey, setActiveTabKey] = useState<FiatTabKey | CollateralTabKey>('deposit')
  const [formDisabled, setFormDisabled] = useState(false)
  const [fiatBalance, refetchFiatBalance] = useFIATBalance(true)
  const { position, refetch: refetchPosition } = useManagePositionInfo()

  useEffect(() => {
    setActiveTabKey(() => (activeSection === 'collateral' ? 'deposit' : 'borrow'))
  }, [activeSection])

  useDynamicTitle(`Manage Position`)

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
    maxWithdrawAmount,
    setFinished,
    setupProxy,
  } = useManagePositionForm(position as Position, formValues, activeTabKey, onSuccess)

  const summary = useManageFormSummary(position as Position, formValues)

  const { address: currentUserAddress, readOnlyAppProvider } = useWeb3Connection()

  const maxRepay = BigNumber.min(maxRepayAmount ?? ZERO_BIG_NUMBER, fiatBalance)
  const tokenSymbol = position?.symbol ?? ''

  const { tokenInfo: underlyingInfo } = useTokenDecimalsAndBalance({
    tokenData: {
      decimals: 8,
      symbol: position?.underlier?.symbol ?? '',
      address: position?.underlier?.address ?? '',
    },
    address: currentUserAddress,
    readOnlyAppProvider,
    tokenId: position?.tokenId ?? '0',
  })

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

  useEffect(() => {
    updateNextState(0)
  }, [updateNextState])

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

  const enableButtons =
    !isProxyAvailable ||
    !hasTokenAllowance ||
    (!hasFiatAllowance && isRepayingFIAT) ||
    (!hasMonetaAllowance && isRepayingFIAT)

  const isMatured = position?.maturity.getTime() && position?.maturity.getTime() < Date.now()

  const getMaturedFCashMessage = (): string | null => {
    if (position?.protocol === 'Notional Finance' && isMatured) {
      return 'Note: This fCash has matured; you will receive the underlying asset'
    }
    return null
  }

  return (
    <>
      <ButtonBack href="/your-positions">Back</ButtonBack>
      <PositionFormsLayout infoBlocks={infoBlocks}>
        {!finished ? (
          <>
            <StepperTitle
              currentStep={step + 1}
              description={steps[step].description}
              title={'Manage your position'}
              totalSteps={steps.length}
            />
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
            <Form form={form} onValuesChange={handleFormChange}>
              <fieldset>
                <div className={cn(s.component)}>
                  {'collateral' === activeSection && isCollateralTab(activeTabKey) && (
                    <>
                      <Tabs className={cn(s.tabs)}>
                        {!isMatured && (
                          <>
                            <Tab
                              isActive={'deposit' === activeTabKey}
                              onClick={() => {
                                form.setFieldsValue({ withdraw: undefined })
                                setActiveTabKey('deposit')
                              }}
                            >
                              Deposit
                            </Tab>
                            <Tab
                              isActive={'depositUnderlier' === activeTabKey}
                              onClick={() => {
                                form.setFieldsValue({ deposit: undefined })
                                setActiveTabKey('depositUnderlier')
                              }}
                            >
                              Deposit Underlier
                            </Tab>
                          </>
                        )}
                        <Tab
                          isActive={'withdraw' === activeTabKey}
                          onClick={() => {
                            form.setFieldsValue({ deposit: undefined })
                            setActiveTabKey('withdraw')
                          }}
                        >
                          Withdraw
                        </Tab>
                        <Tab
                          isActive={'withdrawUnderlier' === activeTabKey}
                          onClick={() => {
                            form.setFieldsValue({ deposit: undefined })
                            setActiveTabKey('withdrawUnderlier')
                          }}
                        >
                          Withdraw Underlier
                        </Tab>
                      </Tabs>
                      {'deposit' === activeTabKey && position && (
                        <>
                          <Balance
                            title="Select amount to deposit"
                            value={`Available: ${availableDepositAmount?.toFixed(4)}`}
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
                      {'depositUnderlier' === activeTabKey && position && (
                        <>
                          <Balance
                            title="Swap and deposit"
                            value={`Available: ${underlyingInfo?.humanValue?.toFixed(2)}`}
                          />
                          <Form.Item name="deposit" required>
                            <TokenAmount
                              displayDecimals={4}
                              healthFactorValue={healthFactor}
                              mainAsset={position.vaultName}
                              max={underlyingInfo?.humanValue}
                              maximumFractionDigits={4}
                              numericInputDisabled={formDisabled}
                              onChange={(val) =>
                                val && send({ type: 'SET_UNDERLIER_AMOUNT', underlierAmount: val })
                              }
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
                            value={`Available: ${availableWithdrawAmount?.toFixed(4)}`}
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
                      {'withdrawUnderlier' === activeTabKey && position && (
                        <>
                          <Balance
                            title="Select amount to withdraw"
                            value={`Available: ${availableWithdrawAmount?.toFixed(4)}`}
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
                    </>
                  )}
                  {'fiat' === activeSection && isFiatTab(activeTabKey) && (
                    <>
                      <Tabs className={cn(s.tabs)}>
                        <Tab
                          isActive={'borrow' === activeTabKey}
                          onClick={() => {
                            form.setFieldsValue({ repay: undefined })
                            setActiveTabKey('borrow')
                          }}
                        >
                          Borrow
                        </Tab>
                        <Tab
                          isActive={'repay' === activeTabKey}
                          onClick={() => {
                            form.setFieldsValue({ borrow: undefined })
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
                            value={`Available: ${fiatBalance?.toFixed(4)}`}
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
                            value={`Available: ${fiatBalance?.toFixed(4)}`}
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
                    {summary.map((item, index) => {
                      return (
                        <SummaryItem
                          key={index}
                          state={item?.state}
                          title={item.title}
                          titleTooltip={item?.titleTooltip}
                          value={item.value}
                        />
                      )
                    })}
                  </div>
                </div>
              </fieldset>
            </Form>
          </>
        ) : (
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
        )}
      </PositionFormsLayout>
    </>
  )
}

export default withRequiredConnection(PositionManage)
