import s from './s.module.scss'
import cn from 'classnames'
import { DepositForm } from '@/src/components/custom/manage-position/DepositForm'
import { WithdrawForm } from '@/src/components/custom/manage-position/WithdrawForm'
import { Tab, Tabs } from '@/src/components/custom'
import { contracts } from '@/src/constants/contracts'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { useManagePositionInfo } from '@/src/hooks/managePosition'
import { useExtractPositionIdData } from '@/src/utils/managePosition'

const COLLATERAL_KEYS = ['deposit', 'withdraw'] as const

export const isCollateralTab = (key: string): key is ManageCollateralProps['activeTabKey'] => {
  return COLLATERAL_KEYS.includes(key as ManageCollateralProps['activeTabKey'])
}

export interface ManageCollateralProps {
  activeTabKey: typeof COLLATERAL_KEYS[number]
  setActiveTabKey: (key: ManageCollateralProps['activeTabKey']) => void
}

export const ManageCollateral = ({ activeTabKey, setActiveTabKey }: ManageCollateralProps) => {
  const { position, refetch: refetchPosition } = useManagePositionInfo()
  const { vaultAddress } = useExtractPositionIdData()
  const [collateralAddress] = useContractCall(vaultAddress, contracts.VAULT_20.abi, 'token', null)

  return (
    <div className={cn(s.component)}>
      <Tabs className={cn(s.tabs)}>
        <Tab isActive={'deposit' === activeTabKey} onClick={() => setActiveTabKey('deposit')}>
          Deposit
        </Tab>
        <Tab isActive={'withdraw' === activeTabKey} onClick={() => setActiveTabKey('withdraw')}>
          Withdraw
        </Tab>
      </Tabs>
      {'deposit' === activeTabKey && (
        <DepositForm tokenAddress={collateralAddress} vaultAddress={vaultAddress} />
      )}
      {'withdraw' === activeTabKey && (
        <WithdrawForm
          refetch={refetchPosition}
          tokenAddress={collateralAddress}
          userBalance={position?.totalCollateral}
          vaultAddress={vaultAddress}
        />
      )}
    </div>
  )
}
