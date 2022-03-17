import s from './s.module.scss'
import cn from 'classnames'
import { KeyedMutator } from 'swr'
import { DepositForm } from '@/src/components/custom/manage-position/DepositForm'
import { WithdrawForm } from '@/src/components/custom/manage-position/WithdrawForm'
import { Tab, Tabs } from '@/src/components/custom'
import { Position } from '@/src/utils/data/positions'

const COLLATERAL_KEYS = ['deposit', 'withdraw'] as const

export const isCollateralTab = (key: string): key is ManageCollateralProps['activeTabKey'] => {
  return COLLATERAL_KEYS.includes(key as ManageCollateralProps['activeTabKey'])
}

export interface ManageCollateralProps {
  activeTabKey: typeof COLLATERAL_KEYS[number]
  setActiveTabKey: (key: ManageCollateralProps['activeTabKey']) => void
  position?: Position
  refetchPosition: KeyedMutator<Position>
}

export const ManageCollateral = ({
  activeTabKey,
  position,
  setActiveTabKey,
}: ManageCollateralProps) => {
  return (
    <>
      <Tabs className={cn(s.tabs)}>
        <Tab isActive={'deposit' === activeTabKey} onClick={() => setActiveTabKey('deposit')}>
          Deposit
        </Tab>
        <Tab isActive={'withdraw' === activeTabKey} onClick={() => setActiveTabKey('withdraw')}>
          Withdraw
        </Tab>
      </Tabs>
      {'deposit' === activeTabKey && position && <DepositForm position={position} />}

      {'withdraw' === activeTabKey && position && <WithdrawForm position={position} />}
    </>
  )
}
