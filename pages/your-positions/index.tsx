import s from './s.module.scss'
import { getHealthFactorState, remainingTime } from '@/src/utils/table'
import withRequiredConnection from '@/src/hooks/RequiredConnection'
import withRequiredValidChain from '@/src/hooks/RequiredValidChain'
import { Tab, Tabs } from '@/src/components/custom'
import { InfoBlocksGrid } from '@/src/components/custom/info-blocks-grid'
import { InfoBlock } from '@/src/components/custom/info-block'
import InventoryTable from '@/src/components/custom/inventory-table'
import TransactionHistoryTable from '@/src/components/custom/transaction-history-table'
import { usePositionsByUser } from '@/src/hooks/subgraph/usePositionsByUser'
import { useYourPositionInfoPage } from '@/src/utils/data/yourPositionInfo'
import { INFINITE_BIG_NUMBER, WAD_DECIMALS } from '@/src/constants/misc'
import { getHumanValue } from '@/src/web3/utils'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { isValidHealthFactor } from '@/src/utils/data/positions'
import { DEFAULT_HEALTH_FACTOR } from '@/src/constants/healthFactor'
import { useRouter } from 'next/router'
import cn from 'classnames'
import { useState } from 'react'

enum TabState {
  Inventory = 'inventory',
  Transactions = 'transactions',
}

const tabs = [
  {
    children: 'Your Current Inventory',
    key: TabState.Inventory,
  },
  {
    children: 'Transaction History',
    key: TabState.Transactions,
  },
]

const YourPositions = () => {
  const { query } = useRouter()
  const [activeTabKey, setActiveTabKey] = useState<TabState>(() => {
    if (query.transaction) {
      return TabState.Transactions
    }

    return TabState.Inventory
  })
  const { positions } = usePositionsByUser()
  const { pageInformation } = useYourPositionInfoPage(positions)

  const lowestHealthFactor = pageInformation?.lowestHealthFactor?.value ?? INFINITE_BIG_NUMBER
  const lowestHealthFactorPositionAddress = pageInformation?.lowestHealthFactor?.address

  // TODO Fix naming if necessary
  return (
    <>
      <InfoBlocksGrid>
        <InfoBlock
          title="Total Collateral Value"
          value={`$${getHumanValue(pageInformation?.collateralValue, WAD_DECIMALS || 0).toFixed(
            2,
          )}`}
        />
        <InfoBlock
          title={'Total Debt'}
          value={
            <>
              <FiatIcon />
              <>{` ${(getHumanValue(pageInformation?.fiatDebt, WAD_DECIMALS) || 0).toFixed(2)}`}</>
            </>
          }
        />
        <InfoBlock
          state={getHealthFactorState(lowestHealthFactor)}
          title="Lowest Health Factor"
          url={
            lowestHealthFactorPositionAddress
              ? `/your-positions/${lowestHealthFactorPositionAddress}/manage`
              : undefined
          }
          value={
            isValidHealthFactor(lowestHealthFactor)
              ? lowestHealthFactor.toFixed(3)
              : DEFAULT_HEALTH_FACTOR
          }
        />
        <InfoBlock
          title="Next Maturity"
          url={
            pageInformation?.lowestHealthFactor?.address
              ? `/your-positions/${pageInformation.nearestMaturity.address}/manage`
              : undefined
          }
          value={
            pageInformation?.nearestMaturity.value
              ? remainingTime(pageInformation.nearestMaturity.value)
              : '--:--:--'
          }
        />
      </InfoBlocksGrid>
      <Tabs className={cn(s.tabs)}>
        {tabs.map(({ children, key }, index) => (
          <Tab isActive={key === activeTabKey} key={index} onClick={() => setActiveTabKey(key)}>
            {children}
          </Tab>
        ))}
      </Tabs>
      {activeTabKey === TabState.Inventory && <InventoryTable inventory={positions} />}
      {activeTabKey === TabState.Transactions && <TransactionHistoryTable />}
    </>
  )
}

export default withRequiredConnection(withRequiredValidChain(YourPositions))
