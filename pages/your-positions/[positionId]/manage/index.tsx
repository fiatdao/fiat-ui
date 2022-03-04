import s from './s.module.scss'
import cn from 'classnames'
import { useEffect, useState } from 'react'
import Spin from '@/src/components/antd/spin'
import SafeSuspense from '@/src/components/custom/safe-suspense'
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
import { useManagePositionInfo } from '@/src/hooks/managePosition'
import { parseDate } from '@/src/utils/dateTime'
import { getHumanValue } from '@/src/web3/utils'
import { WAD_DECIMALS } from '@/src/constants/misc'

const DynamicContent = () => {
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
      value: position ? `${position.vaultCollateralizationRatio} %` : '-',
    },
    {
      title: 'Borrowing Rate',
      tooltip: 'The annualized cost of interest for minting FIAT.',
      value: getHumanValue(position?.interestPerSecond ?? 0, WAD_DECIMALS).toFixed(2),
    },
  ]
  return (
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
              <RadioTab checked={activeSection === 'fiat'} onClick={() => setActiveSection('fiat')}>
                FIAT
              </RadioTab>
            </RadioTabsWrapper>
          </div>
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
        </>
      }
      infoBlocks={infoBlocks}
    />
  )
}

const PositionManager = () => {
  return (
    <>
      <ButtonBack href="/your-positions">Back</ButtonBack>

      <SafeSuspense fallback={<Spin />}>
        <DynamicContent />
      </SafeSuspense>
    </>
  )
}

export default withRequiredConnection(PositionManager)
