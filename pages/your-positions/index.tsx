import {
  Position,
  PositionTransaction,
  YourPositionPageInformation,
  fetchInfoPage,
  fetchPositions,
  swrFetcher,
} from '../../src/utils/your-positions-api'
import { useEffect, useState } from 'react'

import useSWR from 'swr'
import { Tab, Tabs } from '@/src/components/custom'
import { InfoBlocksGrid } from '@/src/components/custom/info-blocks-grid'
import { InfoBlock } from '@/src/components/custom/info-block'
import InventoryTable from '@/src/components/custom/inventory-table'
import TransactionHistoryTable from '@/src/components/custom/transaction-history'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { USER_PROXY } from '@/src/queries/userProxy'
import { userProxyVariables, userProxy_userProxy } from '@/types/subgraph/__generated__/userProxy'
import genericSuspense from '@/src/utils/genericSuspense'

const YourPositions = () => {
  const { address, isWalletConnected, readOnlyAppProvider: provider } = useWeb3Connection()
  const [activeTabKey, setActiveTabKey] = useState('inventory')
  const [inventory, setInventory] = useState<Position[]>([])
  const [transactions, setTransactions] = useState<PositionTransaction[]>([])
  const [isLoadingPage, setIsLoadingPage] = useState(false)
  const [pageInformation, setPageInformation] = useState<YourPositionPageInformation>()

  const { data: datagraph, error: errorgraph } = useSWR([USER_PROXY, address], (url, value) =>
    swrFetcher<userProxy_userProxy, userProxyVariables>(url, { id: value! }),
  )

  console.log('useSWR+GQL', { datagraph, errorgraph })

  useEffect(() => {
    const init = async () => {
      if (address && isWalletConnected && provider) {
        setIsLoadingPage(true)
        const [positions, positionTransactions] = await fetchPositions(address, provider)
        const newPageInformation = await fetchInfoPage(positions)
        setPageInformation(newPageInformation)
        setInventory(positions)
        setTransactions(positionTransactions)
        setIsLoadingPage(false)
      }
    }
    init()
  }, [address, isWalletConnected, provider])

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
          <InfoBlock title="Total Debt" value={pageInformation?.totalDebt} />
          <InfoBlock title="Current Value" value={pageInformation?.currentValue} />
          <InfoBlock title="Lowest Health Factor" value={pageInformation?.lowestHealthFactor} />
          <InfoBlock title="Next Maturity" value={pageInformation?.nextMaturity} />
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
