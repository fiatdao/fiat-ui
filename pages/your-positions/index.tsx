import s from './s.module.scss'

import {
  Inventory,
  Transaction,
  YourPositionPageInformation,
  inventoryMockFetch,
  transactionMockFetch,
  yourPositionPageInformationMockFetch,
} from '../../src/utils/your-positions-api'
import { useState } from 'react'
import { Text } from '@/src/components/custom/typography'
import { Tabs } from '@/src/components/custom'
import { InfoBlocksGrid } from '@/src/components/custom/info-blocks-grid'
import { InfoBlock } from '@/src/components/custom/info-block'
import useFetch from '@/src/hooks/useFetch'
import InventoryTable from '@/src/components/custom/tables/InventoryTable'
import TransactionHistoryTable from '@/src/components/custom/tables/TransactionHistoryTable'

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

      <div className="card-header">
        <Tabs
          activeKey={activeTabKey}
          onClick={setActiveTabKey}
          tabs={[
            {
              id: 'inventory',
              children: (
                <Text color="secondary" type="p1">
                  Your Current Inventory
                </Text>
              ),
            },
            {
              id: 'history',
              children: (
                <Text color="secondary" type="p1">
                  Transaction History
                </Text>
              ),
            },
          ]}
        ></Tabs>
      </div>
      {activeTabKey === 'inventory' ? (
        <InventoryTable inventory={inventory} />
      ) : (
        <TransactionHistoryTable transactions={transactions} />
      )}
    </>
  )
}

export default YourPositions
