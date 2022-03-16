import s from './s.module.scss'
import { perSecondToAPY } from '../../../../src/web3/utils'
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
import { getTokenByAddress } from '@/src/constants/bondTokens'

const DynamicContent = () => {
  const [activeSection, setActiveSection] = useState<'collateral' | 'fiat'>('collateral')
  const [activeTabKey, setActiveTabKey] = useState<
    ManageCollateralProps['activeTabKey'] | ManageFiatProps['activeTabKey']
  >('deposit')

  const { position, refetch: refetchPosition } = useManagePositionInfo()

  useEffect(() => {
    setActiveTabKey(() => (activeSection === 'collateral' ? 'deposit' : 'mint'))
  }, [activeSection])

  const tokenSymbol = getTokenByAddress(position?.collateral.address ?? null)?.symbol ?? ''
  useDynamicTitle(`Manage position`)

  const infoBlocks = [
    {
      title: 'Token',
      value: position ? tokenSymbol : '-',
    },
    {
      title: 'Underlying Asset',
      value: position ? position.underlier.symbol : '-',
    },
    {
      title: 'Maturity Date',
      tooltip: 'The date on which the bond is redeemable for its underlying assets.',
      value: position?.maturity ? parseDate(position?.maturity) : '-',
    },
    {
      title: 'Face Value',
      tooltip: 'The redeemable value of the bond at maturity.',
      value: `$${getHumanValue(position?.faceValue ?? 0, WAD_DECIMALS)?.toFixed(3)}`,
    },
    {
      title: 'Price',
      tooltip: 'The currently discounted value of the bond.',
      value: `$${getHumanValue(position?.collateralValue ?? 0, WAD_DECIMALS * 2)?.toFixed(3)}`,
    },
    {
      title: 'Collateralization Ratio',
      tooltip: 'The minimum amount of over-collateralization required to mint FIAT.',
      value: position?.vaultCollateralizationRatio?.toFixed() ?? '-',
    },
    {
      title: 'Interest Rate',
      tooltip: 'The annualized cost of interest for minting FIAT.',
      value: `${perSecondToAPY(getHumanValue(position?.interestPerSecond, WAD_DECIMALS)).toFixed(
        3,
      )}%`,
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
