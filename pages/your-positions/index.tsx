import { useEffect, useState } from 'react'
import { remainingTime } from '@/src/utils/your-positions-utils'
import {
  Position,
  PositionTransaction,
  YourPositionPageInformation,
  fetchInfoPage,
  fetchPositions,
} from '@/src/utils/your-positions-api'

import { Tab, Tabs } from '@/src/components/custom'
import { InfoBlocksGrid } from '@/src/components/custom/info-blocks-grid'
import { InfoBlock } from '@/src/components/custom/info-block'
import InventoryTable from '@/src/components/custom/inventory-table'
import TransactionHistoryTable from '@/src/components/custom/transaction-history'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

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
  const [activeTabKey, setActiveTabKey] = useState('inventory')
  const [inventory, setInventory] = useState<Position[]>([])
  const [transactions, setTransactions] = useState<PositionTransaction[]>([])
  const [isLoadingPage, setIsLoadingPage] = useState(false)
  const [pageInformation, setPageInformation] = useState<YourPositionPageInformation>()

  useEffect(() => {
    const init = async () => {
      if (address && isWalletConnected && provider) {
        setIsLoadingPage(true)
        const [positions, positionTransactions] = await fetchPositions(address, provider)
        const newPageInformation = fetchInfoPage(positions)
        setPageInformation(newPageInformation)
        setInventory(positions)
        setTransactions(positionTransactions)
        setIsLoadingPage(false)
      }
    }
    init()
  }, [address, isWalletConnected, provider])

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

export default YourPositions
