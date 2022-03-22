import s from './s.module.scss'
import cn from 'classnames'
import React, { useEffect, useState } from 'react'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { useRouter } from 'next/router'
import withRequiredConnection from '@/src/hooks/RequiredConnection'
import { useDynamicTitle } from '@/src/hooks/useDynamicTitle'
import { PositionFormsLayout } from '@/src/components/custom/position-forms-layout'
import { ButtonBack } from '@/src/components/custom/button-back'
import { RadioTab, RadioTabsWrapper } from '@/src/components/antd/radio-tab'
import {
  useManageFormSummary,
  useManagePositionForm,
  useManagePositionInfo,
  useManagePositionsInfoBlock,
} from '@/src/hooks/managePosition'
import { Position } from '@/src/utils/data/positions'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { SummaryItem } from '@/src/components/custom/summary'
import { Tab, Tabs, TokenAmount } from '@/src/components/custom'
import { Balance } from '@/src/components/custom/balance'
import { Form } from '@/src/components/antd'
import { contracts } from '@/src/constants/contracts'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'

const FIAT_KEYS = ['burn', 'mint'] as const
type FiatTabKey = typeof FIAT_KEYS[number]

export const isFiatTab = (key: string): key is FiatTabKey => {
  return FIAT_KEYS.includes(key as FiatTabKey)
}

const COLLATERAL_KEYS = ['deposit', 'withdraw'] as const
type CollateralTabKey = typeof COLLATERAL_KEYS[number]

export const isCollateralTab = (key: string): key is CollateralTabKey => {
  return COLLATERAL_KEYS.includes(key as CollateralTabKey)
}

export type PositionManageFormFields = {
  burn: BigNumber
  withdraw: BigNumber
  mint: BigNumber
  deposit: BigNumber
}

const PositionManage = () => {
  const [form] = AntdForm.useForm<PositionManageFormFields>()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<'collateral' | 'fiat'>('collateral')
  const [activeTabKey, setActiveTabKey] = useState<FiatTabKey | CollateralTabKey>('deposit')

  const { position } = useManagePositionInfo()

  useEffect(() => {
    setActiveTabKey(() => (activeSection === 'collateral' ? 'deposit' : 'mint'))
  }, [activeSection])

  useDynamicTitle(`Manage Position`)

  const infoBlocks = useManagePositionsInfoBlock(position as Position)
  const formValues = form.getFieldsValue(true) as PositionManageFormFields

  const onSuccess = () => {
    // @TODO: reload page after finish tx, instead of resetting values
    //        because the Fiat Amount header does not update after this tx
    // form.resetFields()
    // refetchPosition()
    router.reload()
  }

  const {
    availableBurnValue,
    availableDepositValue,
    availableMintValue,
    availableWithdrawValue,
    buttonText,
    handleFormChange,
    handleManage,
    healthFactor,
    isLoading,
    maxBurnValue,
    maxDepositValue,
    maxMintValue,
    maxWithdrawValue,
  } = useManagePositionForm(position as Position, formValues, onSuccess)

  const summary = useManageFormSummary(position as Position, formValues)
  const healthFactorNumber = healthFactor?.toFixed(3)

  return (
    <>
      <ButtonBack href="/your-positions">Back</ButtonBack>

      <PositionFormsLayout
        form={
          <>
            <div className={cn(s.top)}>
              <RadioTabsWrapper>
                <RadioTab
                  checked={activeSection === 'collateral'}
                  onClick={() => setActiveSection('collateral')}
                >
                  Collateral
                </RadioTab>
                <RadioTab
                  checked={activeSection === 'fiat'}
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
                          isActive={'withdraw' === activeTabKey}
                          onClick={() => {
                            form.setFieldsValue({ deposit: undefined })
                            setActiveTabKey('withdraw')
                          }}
                        >
                          Withdraw
                        </Tab>
                      </Tabs>
                      {'deposit' === activeTabKey && position && (
                        <>
                          <Balance
                            title="Select amount to deposit"
                            value={`Available: ${availableDepositValue?.toFixed(4)}`}
                          />
                          <Form.Item name="deposit" required>
                            <TokenAmount
                              displayDecimals={4}
                              healthFactorValue={healthFactorNumber}
                              mainAsset={position.protocol}
                              max={maxDepositValue}
                              maximumFractionDigits={6}
                              secondaryAsset={position.underlier.symbol}
                              slider={'healthFactorVariantReverse'}
                            />
                          </Form.Item>
                        </>
                      )}
                      {'withdraw' === activeTabKey && position && (
                        <>
                          <Balance
                            title="Select amount to withdraw"
                            value={`Available: ${availableWithdrawValue?.toFixed(4)}`}
                          />
                          <Form.Item name="withdraw" required>
                            <TokenAmount
                              displayDecimals={4}
                              healthFactorValue={healthFactorNumber}
                              mainAsset={position.protocol}
                              max={maxWithdrawValue}
                              maximumFractionDigits={6}
                              secondaryAsset={position.underlier.symbol}
                              slider={'healthFactorVariant'}
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
                          isActive={'mint' === activeTabKey}
                          onClick={() => {
                            form.setFieldsValue({ burn: undefined })
                            setActiveTabKey('mint')
                          }}
                        >
                          Borrow
                        </Tab>
                        <Tab
                          isActive={'burn' === activeTabKey}
                          onClick={() => {
                            form.setFieldsValue({ mint: undefined })
                            setActiveTabKey('burn')
                          }}
                        >
                          Repay
                        </Tab>
                      </Tabs>
                      {'mint' === activeTabKey && position && (
                        <>
                          <Balance
                            title="Select amount to borrow"
                            value={`Available: ${availableMintValue?.toFixed(4)}`}
                          />
                          <Form.Item name="mint" required>
                            <TokenAmount
                              displayDecimals={contracts.FIAT.decimals}
                              healthFactorValue={healthFactorNumber}
                              max={maxMintValue}
                              maximumFractionDigits={contracts.FIAT.decimals}
                              slider={'healthFactorVariant'}
                              tokenIcon={<FiatIcon />}
                            />
                          </Form.Item>
                        </>
                      )}
                      {'burn' === activeTabKey && position && (
                        <>
                          <Balance
                            title="Select amount to repay"
                            value={`Available: ${availableBurnValue?.toFixed(4)}`}
                          />
                          <Form.Item name="burn" required>
                            <TokenAmount
                              displayDecimals={contracts.FIAT.decimals}
                              healthFactorValue={healthFactorNumber}
                              max={maxBurnValue}
                              maximumFractionDigits={contracts.FIAT.decimals}
                              slider={'healthFactorVariantReverse'}
                              tokenIcon={<FiatIcon />}
                            />
                          </Form.Item>
                        </>
                      )}
                    </>
                  )}

                  <ButtonsWrapper>
                    <ButtonGradient
                      height="lg"
                      loading={isLoading}
                      onClick={() => handleManage(formValues)}
                    >
                      {buttonText}
                    </ButtonGradient>
                  </ButtonsWrapper>
                  <div className={cn(s.summary)}>
                    {summary.map((item, index) => (
                      <SummaryItem key={index} title={item.title} value={item.value} />
                    ))}
                  </div>
                </div>
              </fieldset>
            </Form>
          </>
        }
        infoBlocks={infoBlocks}
      />
    </>
  )
}

export default withRequiredConnection(PositionManage)
