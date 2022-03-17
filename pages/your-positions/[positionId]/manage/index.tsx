import s from './s.module.scss'
import { perSecondToAPY } from '../../../../src/web3/utils'
import cn from 'classnames'
import React, { useEffect, useState } from 'react'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import withRequiredConnection from '@/src/hooks/RequiredConnection'
import { useDynamicTitle } from '@/src/hooks/useDynamicTitle'
import {
  ManageFiat,
  ManageFiatProps,
  isFiatTab,
} from '@/src/components/custom/manage-position/ManageFiat'
import {
  ManageCollateral,
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
} from '@/src/hooks/managePosition'
import { parseDate } from '@/src/utils/dateTime'
import { getHumanValue } from '@/src/web3/utils'
import { WAD_DECIMALS } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { Position } from '@/src/utils/data/positions'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { SummaryItem } from '@/src/components/custom/summary'

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

  const { position, refetch: refetchPosition } = useManagePositionInfo()

  useEffect(() => {
    setActiveTabKey(() => (activeSection === 'collateral' ? 'deposit' : 'mint'))
  }, [activeSection])

  useDynamicTitle(`Manage ${position?.collateral.symbol} position`)

  const infoBlocks = [
    {
      title: 'Bond Name',
      value: position ? position.collateral.symbol : '-',
    },
    {
      title: 'Underlying',
      value: position ? position.underlier.symbol : '-',
    },
    {
      title: 'Bond Maturity',
      tooltip: 'The date on which the bond is redeemable for its underlying assets.',
      value: position?.maturity ? parseDate(position?.maturity) : '-',
    },
    {
      title: 'Bond Face Value',
      tooltip: 'The redeemable value of the bond at maturity.',
      value: `$${getHumanValue(position?.faceValue ?? 0, WAD_DECIMALS)?.toFixed(3)}`,
    },
    {
      title: 'Bond Collateral Value',
      tooltip: 'The currently discounted value of the bond.',
      value: `$${getHumanValue(position?.collateralValue ?? 0, WAD_DECIMALS)?.toFixed(3)}`,
    },
    {
      title: 'Collateralization Ratio',
      tooltip: 'The minimum amount of over-collateralization required to mint FIAT.',
      value: position?.vaultCollateralizationRatio?.toFixed() ?? '-',
    },
    {
      title: 'Interest Rate',
      tooltip: 'The annualized cost of interest for minting FIAT.',
      value: `${perSecondToAPY(getHumanValue(position?.interestPerSecond ?? 0)).toFixed(3)}%`,
    },
  ]

  const { buttonText, handleFormChange, handleManage, isLoading } = useManagePositionForm(
    position as Position,
  )
  const summary = useManageFormSummary(position as Position, form.getFieldsValue())

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

            <Form form={form} onFinish={handleManage} onValuesChange={handleFormChange}>
              <fieldset>
                <div className={cn(s.component)}>
                  {'collateral' === activeSection && isCollateralTab(activeTabKey) && (
                    <ManageCollateral
                      activeTabKey={activeTabKey}
                      position={position}
                      refetchPosition={refetchPosition}
                      setActiveTabKey={setActiveTabKey}
                    />
                  )}

                  {'fiat' === activeSection && isFiatTab(activeTabKey) && (
                    <ManageFiat
                      activeTabKey={activeTabKey}
                      position={position}
                      refetchPosition={refetchPosition}
                      setActiveTabKey={setActiveTabKey}
                    />
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
