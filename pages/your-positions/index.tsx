import { useState } from 'react'

import {
  Inventory,
  Transaction,
  YourPositionPageInformation,
  inventoryMockFetch,
  transactionMockFetch,
  yourPositionPageInformationMockFetch,
} from '@/src/utils/your-positions-api'
import { Tab, Tabs } from '@/src/components/custom'
import { InfoBlocksGrid } from '@/src/components/custom/info-blocks-grid'
import { InfoBlock } from '@/src/components/custom/info-block'
import useFetch from '@/src/hooks/useFetch'
import InventoryTable from '@/src/components/custom/inventory-table'
import TransactionHistoryTable from '@/src/components/custom/transaction-history'

const YourPositions = () => {
  const [activeTabKey, setActiveTabKey] = useState('inventory')

  const { data: yourPosition, loading: isLoadingPage } = useFetch<YourPositionPageInformation>({
    url: 'your-position',
    customFetch: yourPositionPageInformationMockFetch,
  })
  const { data: inventory } = useFetch<Inventory[]>({
    url: 'inventory',
    customFetch: inventoryMockFetch,
  })
  const { data: transactions } = useFetch<Transaction[]>({
    url: 'transactions',
    customFetch: transactionMockFetch,
  })

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

  return (
    <>
      {!isLoadingPage && (
        <InfoBlocksGrid>
          <InfoBlock title="Total Debt" value={yourPosition?.totalDebt} />
          <InfoBlock title="Current Value" value={yourPosition?.currentValue} />
          <InfoBlock title="Lowest Health Factor" value={yourPosition?.lowestHealthFactor} />
          <InfoBlock title="Next Maturity" value={yourPosition?.nextMaturity} />
        </InfoBlocksGrid>
      )}
      <Tabs>
        {tabs.map(({ children, key }, index) => (
          <Tab isActive={key === activeTabKey} key={index} onClick={() => setActiveTabKey(key)}>
            {children}
          </Tab>
        ))}
      </Tabs>
      {activeTabKey === TabState.Inventory && <InventoryTable inventory={inventory} />}
      {activeTabKey === TabState.Transactions && (
        <TransactionHistoryTable transactions={transactions} />
      )}
    </>
  )
}

export default YourPositions
