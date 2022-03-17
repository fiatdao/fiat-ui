import s from './s.module.scss'
import cn from 'classnames'
import React, { useEffect, useState } from 'react'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import withRequiredConnection from '@/src/hooks/RequiredConnection'
import { useDynamicTitle } from '@/src/hooks/useDynamicTitle'
import { ManageFiatProps, isFiatTab } from '@/src/components/custom/manage-position/ManageFiat'
import {
  ManageCollateralProps,
  isCollateralTab,
} from '@/src/components/custom/manage-position/ManageCollateral'
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
import { Tab, Tabs } from '@/src/components/custom'
import { Balance } from '@/src/components/custom/balance'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { getHumanValue } from '@/src/web3/utils'
import { WAD_DECIMALS } from '@/src/constants/misc'
import { contracts } from '@/src/constants/contracts'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'

export type PositionManageFormFields = {
  burn: BigNumber
  withdraw: BigNumber
  mint: BigNumber
  deposit: BigNumber
}

const PositionManage = () => {
  const [form] = AntdForm.useForm<PositionManageFormFields>()
  const [activeSection, setActiveSection] = useState<'collateral' | 'fiat'>('collateral')
  const [activeTabKey, setActiveTabKey] = useState<
    ManageCollateralProps['activeTabKey'] | ManageFiatProps['activeTabKey']
  >('deposit')

  // eslint-disable-next-line
  const { position, refetch: refetchPosition } = useManagePositionInfo()

  useEffect(() => {
    setActiveTabKey(() => (activeSection === 'collateral' ? 'deposit' : 'mint'))
  }, [activeSection])

  useDynamicTitle(`Manage ${position?.collateral.symbol} position`)

  const infoBlocks = useManagePositionsInfoBlock(position as Position)
  const formValues = form.getFieldsValue()
  const {
    buttonText,
    handleFormChange,
    handleManage,
    healthFactor,
    isLoading,
    maxBurnValue,
    maxDepositValue,
    maxMintValue,
    maxWithdrawValue,
  } = useManagePositionForm(position as Position, formValues)

  const summary = useManageFormSummary(position as Position, form.getFieldsValue())

  const maxAvailableDeposit = Number(maxDepositValue?.toFixed(4))
  const maxAvailableWithdraw = Number(
    getHumanValue(maxWithdrawValue, WAD_DECIMALS).toFixed(4, BigNumber.ROUND_FLOOR),
  )
  const maxAvailableMint = Number(
    getHumanValue(maxMintValue, WAD_DECIMALS).toFixed(4, BigNumber.ROUND_FLOOR),
  )
  const maxAvailableBurn = Number(
    getHumanValue(maxBurnValue, WAD_DECIMALS).toFixed(4, BigNumber.ROUND_FLOOR),
  )
  const healthFactorNumber = Number(getHumanValue(healthFactor, WAD_DECIMALS)?.toFixed(4))

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

            <Form
              form={form}
              onFinish={handleManage}
              onValuesChange={handleFormChange}
              preserve={true}
            >
              <fieldset>
                <div className={cn(s.component)}>
                  {'collateral' === activeSection && isCollateralTab(activeTabKey) && (
                    <>
                      <Tabs className={cn(s.tabs)}>
                        <Tab
                          isActive={'deposit' === activeTabKey}
                          onClick={() => setActiveTabKey('deposit')}
                        >
                          Deposit
                        </Tab>
                        <Tab
                          isActive={'withdraw' === activeTabKey}
                          onClick={() => setActiveTabKey('withdraw')}
                        >
                          Withdraw
                        </Tab>
                      </Tabs>
                      {'deposit' === activeTabKey && position && (
                        <>
                          <Balance
                            title="Select amount to deposit"
                            value={`Available: ${maxAvailableDeposit}`}
                          />
                          <Form.Item name="deposit" preserve={true} required>
                            <TokenAmount
                              displayDecimals={4}
                              healthFactorValue={healthFactorNumber}
                              mainAsset={position.protocol}
                              max={maxAvailableDeposit}
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
                            value={`Available: ${maxAvailableWithdraw}`}
                          />
                          <Form.Item name="withdraw" required>
                            <TokenAmount
                              displayDecimals={4}
                              healthFactorValue={healthFactorNumber}
                              mainAsset={position.protocol}
                              max={maxAvailableWithdraw}
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
                          onClick={() => setActiveTabKey('mint')}
                        >
                          Mint
                        </Tab>
                        <Tab
                          isActive={'burn' === activeTabKey}
                          onClick={() => setActiveTabKey('burn')}
                        >
                          Burn
                        </Tab>
                      </Tabs>
                      {'mint' === activeTabKey && position && (
                        <>
                          <Balance
                            title="Select amount to mint"
                            value={`Available: ${maxAvailableMint}`}
                          />
                          <Form.Item name="mint" preserve={true} required>
                            <TokenAmount
                              displayDecimals={contracts.FIAT.decimals}
                              healthFactorValue={healthFactorNumber}
                              max={maxAvailableMint}
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
                            title="Select amount to burn"
                            value={`Available: ${maxAvailableBurn}`}
                          />
                          <Form.Item name="burn" preserve={true} required>
                            <TokenAmount
                              displayDecimals={contracts.FIAT.decimals}
                              healthFactorValue={healthFactorNumber}
                              max={maxAvailableBurn}
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
                    <ButtonGradient height="lg" htmlType="submit" loading={isLoading}>
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
