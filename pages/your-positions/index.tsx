import { fetchInfoPage } from '../../src/utils/your-positions-api'
import { useEffect, useState } from 'react'

import { Tab, Tabs } from '@/src/components/custom'
import { InfoBlocksGrid } from '@/src/components/custom/info-blocks-grid'
import { InfoBlock } from '@/src/components/custom/info-block'
import InventoryTable from '@/src/components/custom/inventory-table'
import TransactionHistoryTable from '@/src/components/custom/transaction-history-table'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import genericSuspense from '@/src/utils/genericSuspense'
import { Position, YourPositionPageInformation } from '@/src/hooks/subgraph'
import { usePositionsByUser } from '@/src/hooks/subgraph/usePositionsByUser'
import { remainingTime } from '@/src/utils/dateTime'

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
  const { address, isWalletConnected, readOnlyAppProvider: provider } = useWeb3Connection()
  const [activeTabKey, setActiveTabKey] = useState<TabState>(TabState.Inventory)
  const [inventory, setInventory] = useState<Position[]>([])
  const [isLoadingPage, setIsLoadingPage] = useState(false)
  const [pageInformation, setPageInformation] = useState<YourPositionPageInformation>()

  const { positionTransactions: transactions, positions } = usePositionsByUser(address)

  useEffect(() => {
    const init = async () => {
      if (address && isWalletConnected && provider) {
        setIsLoadingPage(true)
        const newPageInformation = await fetchInfoPage(positions || [])
        setPageInformation(newPageInformation)
        setInventory(positions)
        setIsLoadingPage(false)
      }
    }
    init()
  }, [address, isWalletConnected, positions, provider])

  return (
    <>
      {!isLoadingPage && (
        <InfoBlocksGrid>
          <InfoBlock title="Total Debt" value={pageInformation?.totalDebt} />
          <InfoBlock title="Current Value" value={pageInformation?.currentValue} />
          <InfoBlock title="Lowest Health Factor" value={pageInformation?.lowestHealthFactor} />
          <InfoBlock
            title="Next Maturity"
            value={
              pageInformation?.nextMaturity
                ? remainingTime(new Date(pageInformation.nextMaturity))
                : undefined
            }
          />
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

export default genericSuspense(YourPositions)
