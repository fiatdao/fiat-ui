import s from './s.module.scss'
import cn from 'classnames'
import { BurnForm } from '@/src/components/custom/manage-position/BurnForm'
import { MintForm } from '@/src/components/custom/manage-position/MintForm'
import { Tab, Tabs } from '@/src/components/custom'
import { useManagePositionInfo } from '@/src/hooks/managePosition'
import { useExtractPositionIdData } from '@/src/utils/managePosition'

const FIAT_KEYS = ['burn', 'mint'] as const
export const isFiatTab = (key: string): key is ManageFiatProps['activeTabKey'] => {
  return FIAT_KEYS.includes(key as ManageFiatProps['activeTabKey'])
}

export interface ManageFiatProps {
  activeTabKey: typeof FIAT_KEYS[number]
  setActiveTabKey: (key: ManageFiatProps['activeTabKey']) => void
}

export const ManageFiat = ({ activeTabKey, setActiveTabKey }: ManageFiatProps) => {
  const { position, refetch: refetchPosition } = useManagePositionInfo()

  const { vaultAddress } = useExtractPositionIdData()

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
      {'mint' === activeTabKey && (
        <MintForm
          refetch={refetchPosition}
          userBalance={position?.discount}
          vaultAddress={vaultAddress}
        />
      )}
      {'burn' === activeTabKey && (
        <BurnForm
          refetch={refetchPosition}
          userBalance={position?.totalNormalDebt}
          vaultAddress={vaultAddress}
        />
      )}
    </div>
  )
}
