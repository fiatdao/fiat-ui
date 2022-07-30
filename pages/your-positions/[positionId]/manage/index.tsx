import s from './s.module.scss'
import { Form } from '@/src/components/antd'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { RadioTab, RadioTabsWrapper } from '@/src/components/antd/radio-tab'
import { Tab, Tabs, TokenAmount } from '@/src/components/custom'
import { Balance } from '@/src/components/custom/balance'
import { ButtonBack } from '@/src/components/custom/button-back'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { PositionFormsLayout } from '@/src/components/custom/position-forms-layout'
import { Summary } from '@/src/components/custom/summary'
import SwapSettingsModal from '@/src/components/custom/swap-settings-modal'
import { contracts } from '@/src/constants/contracts'
import { SET_FIAT_ALLOWANCE_PROXY_TEXT, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import {
  useManagePositionForm,
  useManagePositionInfo,
  useManagePositionsInfoBlock,
} from '@/src/hooks/managePosition'
import withRequiredConnection from '@/src/hooks/RequiredConnection'
import { useCollateral } from '@/src/hooks/subgraph/useCollateral'
import { useDynamicTitle } from '@/src/hooks/useDynamicTitle'
import { useFIATBalance } from '@/src/hooks/useFIATBalance'
import SuccessAnimation from '@/src/resources/animations/success-animation.json'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { Collateral } from '@/src/utils/data/collaterals'
import { Position } from '@/src/utils/data/positions'
import { SHOW_UNDERLYING_FLOW } from '@/src/utils/featureFlags'
import { VaultType } from '@/types/subgraph/__generated__/globalTypes'
import { SettingFilled } from '@ant-design/icons'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import Lottie from 'lottie-react'
import Link from 'next/link'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

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

const WITHDRAW_COLLATERAL_KEYS = ['withdraw', 'withdrawUnderlier', 'redeem']
export type WithdrawCollateralTabKey = typeof COLLATERAL_KEYS[number]

const COLLATERAL_KEYS = ['deposit', 'depositUnderlier', ...WITHDRAW_COLLATERAL_KEYS] as const
export type CollateralTabKey = typeof COLLATERAL_KEYS[number]

const isWithdrawCollateralKey = (key: string): key is WithdrawCollateralTabKey => {
  return WITHDRAW_COLLATERAL_KEYS.includes(key as WithdrawCollateralTabKey)
}

export const isCollateralTab = (key: string): key is CollateralTabKey => {
  return COLLATERAL_KEYS.includes(key as CollateralTabKey)
}

export type PositionManageFormFields = {
  borrow: BigNumber | undefined
  depositAmount: BigNumber | undefined
  underlierDepositAmount: BigNumber | undefined
  repay: BigNumber | undefined
  withdrawAmount: BigNumber | undefined
  underlierWithdrawAmount: BigNumber | undefined
  redeemAmount: BigNumber | undefined
}

const defaultManageFormFields = {
  repay: undefined,
  borrow: undefined,
  withdrawAmount: undefined,
  underlierWithdrawAmount: undefined,
  depositAmount: undefined,
  underlierDepositAmount: undefined,
  redeemAmount: undefined,
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
    // availableWithdrawAmount,
    buttonText,
    finished,
    getFormSummaryData,
    handleFormChange,
    handleManage,
    hasFiatAllowance,
    hasMonetaAllowance,
    hasTokenAllowance,
    healthFactor,
    isDepositingCollateral,
    isDepositingUnderlier,
    isDisabledCreatePosition,
    isLoading,
    isProxyAvailable,
    isRepayingFIAT,
    isWithdrawingCollateral,
    isWithdrawingUnderlier,
    loadingFiatAllowanceApprove,
    loadingMonetaAllowanceApprove,
    loadingProxy,
    loadingTokenAllowanceApprove,
    maxBorrowAmount,
    maxDepositAmount,
    maxRepayAmount,
    maxUnderlierDepositAmount,
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

  const maxRepay = BigNumber.min(maxRepayAmount ?? ZERO_BIG_NUMBER, fiatBalance)
  const shouldUseUnderlierToken = isDepositingUnderlier || isWithdrawingUnderlier
  const tokenSymbol = shouldUseUnderlierToken ? collateral?.underlierSymbol : position?.symbol ?? ''

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

  const summaryData = getFormSummaryData()

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

  const shouldShowUnderlyingUi = useMemo(() => {
    // Show underlying ui if SHOW_UNDERLYING_FLOW is true. Always show for element
    return SHOW_UNDERLYING_FLOW
  }, [])

  useEffect(() => {
    // initialize step to 0
    updateNextState(0)
  }, [updateNextState])

  useEffect(() => {
    // If switching to tab and no subtab is selected, select first tab in the section that makes sense
    setActiveTabKey(activeSection === 'collateral' ? 'deposit' : 'borrow')
  }, [activeSection])

  useEffect(() => {
    // @dev NOTE: If you change this, make sure to check the renderCollateralTabs() function
    if (activeSection === 'collateral') {
      if (isMatured) {
        if (collateral?.vault.type === VaultType.NOTIONAL) {
          // expired notional should only show redeem tab, can't be transferred past maturity
          setActiveTabKey('redeem')
        } else if (!shouldShowUnderlyingUi) {
          setActiveTabKey('withdraw')
        } else if (shouldShowUnderlyingUi) {
          setActiveTabKey('redeem')
        } else if (!isWithdrawCollateralKey(activeTabKey)) {
          setActiveTabKey('withdraw')
        }
      }
    }
  }, [activeSection, activeTabKey, collateral?.vault.type, isMatured, shouldShowUnderlyingUi])

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

  const renderCollateralTabs = useCallback(() => {
    const depositTab = (
      <Tab
        isActive={'deposit' === activeTabKey}
        onClick={() => {
          form.setFieldsValue({
            ...defaultManageFormFields,
            depositAmount: form.getFieldValue('depositAmount'),
            // maintain fiat tab values
            borrow: form.getFieldValue('borrow'),
            repay: form.getFieldValue('repay'),
          })
          setActiveTabKey('deposit')
        }}
      >
        Deposit
      </Tab>
    )

    const depositUnderlierTab = (
      <Tab
        isActive={'depositUnderlier' === activeTabKey}
        onClick={() => {
          form.setFieldsValue({
            ...defaultManageFormFields,
            underlierDepositAmount: form.getFieldValue('underlierDepositAmount'),
            // maintain fiat tab values
            borrow: form.getFieldValue('borrow'),
            repay: form.getFieldValue('repay'),
          })
          setActiveTabKey('depositUnderlier')
        }}
      >
        Deposit Underlier
      </Tab>
    )

    const withdrawTab = (
      <Tab
        isActive={'withdraw' === activeTabKey}
        onClick={() => {
          form.setFieldsValue({
            ...defaultManageFormFields,
            withdrawAmount: form.getFieldValue('withdrawAmount'),
            // maintain fiat tab values
            borrow: form.getFieldValue('borrow'),
            repay: form.getFieldValue('repay'),
          })
          setActiveTabKey('withdraw')
        }}
      >
        Withdraw
      </Tab>
    )

    const withdrawUnderlierTab = (
      <Tab
        isActive={'withdrawUnderlier' === activeTabKey}
        onClick={() => {
          form.setFieldsValue({
            ...defaultManageFormFields,
            underlierWithdrawAmount: form.getFieldValue('underlierWithdrawAmount'),
            // maintain fiat tab values
            borrow: form.getFieldValue('borrow'),
            repay: form.getFieldValue('repay'),
          })
          setActiveTabKey('withdrawUnderlier')
        }}
      >
        Withdraw Underlier
      </Tab>
    )

    const redeemTab = (
      <Tab
        isActive={'redeem' === activeTabKey}
        onClick={() => {
          form.setFieldsValue({
            ...defaultManageFormFields,
            redeemAmount: form.getFieldValue('redeemAmount'),
            // maintain fiat tab values
            borrow: form.getFieldValue('borrow'),
            repay: form.getFieldValue('repay'),
          })
          setActiveTabKey('redeem')
        }}
      >
        Redeem
      </Tab>
    )

    if (isMatured) {
      // @dev NOTE: If you change this, make sure to check the useEffect in this file for setting active section
      if (collateral?.vault.type === VaultType.NOTIONAL) {
        // If collateral is notional post-maturity, show only redeem tab
        return redeemTab
      } else if (!shouldShowUnderlyingUi) {
        // If non-notional & post maturity, and underlier flow off, show withdraw.
        return withdrawTab
      } else if (shouldShowUnderlyingUi) {
        // If non-notional & post maturity, and underlier flow ON, only shouw redeem.
        return redeemTab
      }
    } else {
      // If bond is active (pre-maturity), show all collateral tabs except redeem
      return shouldShowUnderlyingUi
        ? [depositTab, depositUnderlierTab, withdrawTab, withdrawUnderlierTab]
        : [depositTab, withdrawTab]
    }
  }, [activeTabKey, collateral?.vault.type, form, isMatured, shouldShowUnderlyingUi])

  const renderActionButton = useCallback(() => {
    if (step === LAST_STEP) {
      return (
        <ButtonsWrapper>
          <ButtonGradient
            disabled={isLoading || isDisabledCreatePosition}
            height="lg"
            onClick={onHandleManage}
          >
            {buttonText}
          </ButtonGradient>
        </ButtonsWrapper>
      )
    } else {
      if (!enableButtons) {
        // TODO: wtf is this for kek do we need it?
        return null
      }

      let button = null
      if (!isProxyAvailable) {
        button = (
          <ButtonGradient disabled={loadingProxy} height="lg" onClick={onSetupProxy}>
            Setup Proxy
          </ButtonGradient>
        )
      } else if (!hasTokenAllowance && isDepositingCollateral) {
        // make user approve before depositing collateral if no allowance
        // TODO: this handles collateral allowance case. need to handle the case where user doesn't have *underlier* allowance
        return (
          <ButtonGradient
            disabled={loadingTokenAllowanceApprove}
            height="lg"
            onClick={onApproveTokenAllowance}
          >
            Set {tokenSymbol} Allowance
          </ButtonGradient>
        )
      } else if (!hasTokenAllowance && isWithdrawingCollateral) {
        // if no allowance, let user skip approval to withdraw collateral
        return (
          <ButtonsWrapper>
            <ButtonGradient
              disabled={isLoading || isDisabledCreatePosition}
              height="lg"
              onClick={onHandleManage}
            >
              {buttonText}
            </ButtonGradient>
          </ButtonsWrapper>
        )
      } else if (!hasFiatAllowance && isRepayingFIAT) {
        return (
          <ButtonGradient
            disabled={loadingFiatAllowanceApprove}
            height="lg"
            onClick={onApproveFiatAllowance}
          >
            {SET_FIAT_ALLOWANCE_PROXY_TEXT}
          </ButtonGradient>
        )
      } else if (hasFiatAllowance && !hasMonetaAllowance && isRepayingFIAT) {
        return (
          <ButtonGradient
            disabled={loadingMonetaAllowanceApprove}
            height="lg"
            onClick={onApproveMonetaAllowance}
          >
            Enable Proxy for FIAT
          </ButtonGradient>
        )
      } else if (isDepositingUnderlier && !hasTokenAllowance) {
        return (
          <ButtonGradient
            disabled={loadingTokenAllowanceApprove}
            height="lg"
            onClick={onApproveTokenAllowance}
          >
            Set {tokenSymbol} Allowance
          </ButtonGradient>
        )
      } else if (isDepositingUnderlier || isWithdrawingUnderlier) {
        return (
          <ButtonGradient
            disabled={loadingFiatAllowanceApprove}
            height="lg"
            onClick={onHandleManage}
          >
            {buttonText}
          </ButtonGradient>
        )
      } else {
        console.error('Unknown button to render')
      }
      return <ButtonsWrapper>{button}</ButtonsWrapper>
    }
  }, [
    buttonText,
    enableButtons,
    hasFiatAllowance,
    hasMonetaAllowance,
    hasTokenAllowance,
    isDepositingCollateral,
    isDisabledCreatePosition,
    isLoading,
    isProxyAvailable,
    isRepayingFIAT,
    isWithdrawingCollateral,
    loadingFiatAllowanceApprove,
    loadingMonetaAllowanceApprove,
    loadingProxy,
    loadingTokenAllowanceApprove,
    onApproveFiatAllowance,
    onApproveMonetaAllowance,
    onApproveTokenAllowance,
    onHandleManage,
    onSetupProxy,
    step,
    tokenSymbol,
    isDepositingUnderlier,
    isWithdrawingUnderlier,
  ])

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
                      <Tabs className={cn(s.tabs)}>{renderCollateralTabs()}</Tabs>
                      {'deposit' === activeTabKey && position && (
                        <>
                          <Balance
                            title="Amount of collateral to deposit"
                            value={`Available: ${availableDepositAmount?.toFixed(2)}`}
                          />
                          <Form.Item name="depositAmount" required>
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
                          <div className={cn(s.balanceContainer)}>
                            <Balance
                              title="Amount to swap for collateral and deposit"
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
                            title={'Amount of collateral to withdraw'}
                            value={`Available: ${maxWithdrawAmount?.toFixed(2)}`}
                          />
                          <Form.Item name="withdrawAmount" required>
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
                          <div className={cn(s.balanceContainer)}>
                            <Balance
                              title="Amount to withdraw and swap for underlier"
                              value={`Available: ${maxWithdrawAmount?.toFixed(2)}`}
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
                      {'redeem' === activeTabKey && position && (
                        <>
                          <div className={cn(s.balanceContainer)}>
                            <Balance
                              description={getMaturedFCashMessage()}
                              title="Amount of collateral to redeem"
                              value={`Available: ${availableUnderlierWithdrawAmount?.toFixed(2)}`}
                            />
                            <SettingFilled
                              className={cn(s.settings)}
                              onClick={() => setSwapSettingsOpen(!swapSettingsOpen)}
                            />
                          </div>
                          <Form.Item name="redeemAmount" required>
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
                  ) : (
                    <>
                      <Tabs className={cn(s.tabs)}>
                        <Tab
                          isActive={'borrow' === activeTabKey}
                          onClick={() => {
                            form.setFieldsValue({
                              // leave collateral tab fields untouched, reset other fiat subtab
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
                              // leave collateral tab fields untouched, reset other fiat subtab
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
                            title="Amount to borrow"
                            value={`Available: ${maxBorrowAmount?.toFixed(2)}`}
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
                            title="Amount to repay"
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
                  {renderActionButton()}
                  <div className={cn(s.summary)}>
                    <Summary data={summaryData} />
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
