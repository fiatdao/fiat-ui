import { Button } from 'antd'
import AntdRadio from 'antd/lib/radio'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import genericSuspense from '@/src/utils/genericSuspense'
import {
  ManageFiat,
  ManageFiatProps,
  isFiatTab,
} from '@/pages/your-positions/[positionId]/manage/ManageFiat'
import {
  ManageCollateral,
  ManageCollateralProps,
  isCollateralTab,
} from '@/pages/your-positions/[positionId]/manage/ManageCollateral'

const PositionManager = () => {
  const [activeSection, setActiveSection] = useState<'collateral' | 'fiat'>('collateral')
  const [activeTabKey, setActiveTabKey] = useState<
    ManageCollateralProps['activeTabKey'] | ManageFiatProps['activeTabKey']
  >('deposit')

  useEffect(() => {
    setActiveTabKey(() => (activeSection === 'collateral' ? 'deposit' : 'mint'))
  }, [activeSection])

  return (
    <>
      <Link href="/your-positions" passHref>
        <Button>Back</Button>
      </Link>
      <AntdRadio.Group>
        <AntdRadio.Button onClick={() => setActiveSection('collateral')}>
          Collateral
        </AntdRadio.Button>
        <AntdRadio.Button onClick={() => setActiveSection('fiat')}>FIAT</AntdRadio.Button>
      </AntdRadio.Group>
      {'collateral' === activeSection && isCollateralTab(activeTabKey) && (
        <ManageCollateral activeTabKey={activeTabKey} setActiveTabKey={setActiveTabKey} />
      )}
      {'fiat' === activeSection && isFiatTab(activeTabKey) && (
        <ManageFiat activeTabKey={activeTabKey} setActiveTabKey={setActiveTabKey} />
      )}
    </>
  )
}

export default genericSuspense(PositionManager)
