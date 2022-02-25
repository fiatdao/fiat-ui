import s from './s.module.scss'
import cn from 'classnames'
import { KeyedMutator } from 'swr'
import { BurnForm } from '@/src/components/custom/manage-position/BurnForm'
import { MintForm } from '@/src/components/custom/manage-position/MintForm'
import { Tab, Tabs } from '@/src/components/custom'
import { Position } from '@/src/utils/data/positions'

const FIAT_KEYS = ['burn', 'mint'] as const
export const isFiatTab = (key: string): key is ManageFiatProps['activeTabKey'] => {
  return FIAT_KEYS.includes(key as ManageFiatProps['activeTabKey'])
}

export interface ManageFiatProps {
  activeTabKey: typeof FIAT_KEYS[number]
  setActiveTabKey: (key: ManageFiatProps['activeTabKey']) => void
  position?: Position
  refetchPosition: KeyedMutator<Position>
}

export const ManageFiat = ({
  activeTabKey,
  position,
  refetchPosition,
  setActiveTabKey,
}: ManageFiatProps) => {
  return (
    <div className={cn(s.component)}>
      <Tabs className={cn(s.tabs)}>
        <Tab isActive={'mint' === activeTabKey} onClick={() => setActiveTabKey('mint')}>
          Mint
        </Tab>
        <Tab isActive={'burn' === activeTabKey} onClick={() => setActiveTabKey('burn')}>
          Burn
        </Tab>
      </Tabs>
      {'mint' === activeTabKey && <MintForm position={position} refetch={refetchPosition} />}
      {'burn' === activeTabKey && <BurnForm position={position} refetch={refetchPosition} />}
    </div>
  )
}
