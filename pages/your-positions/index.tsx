import s from './s.module.scss'
import { useRouter } from 'next/router'
import cn from 'classnames'
import { useState } from 'react'
import { calculateHealthFactor } from '@/src/utils/table'
import withRequiredConnection from '@/src/hooks/RequiredConnection'
import { Tab, Tabs } from '@/src/components/custom'
import { InfoBlocksGrid } from '@/src/components/custom/info-blocks-grid'
import { InfoBlock } from '@/src/components/custom/info-block'
import InventoryTable from '@/src/components/custom/inventory-table'
import TransactionHistoryTable from '@/src/components/custom/transaction-history-table'
import { usePositionsByUser } from '@/src/hooks/subgraph/usePositionsByUser'
import { remainingTime } from '@/src/utils/dateTime'
import { useYourPositionInfoPage } from '@/src/utils/data/yourPositionInfo'
import { WAD_DECIMALS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { getHumanValue } from '@/src/web3/utils'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'

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
          state={calculateHealthFactor(
            pageInformation?.lowestHealthFactor?.value ?? ZERO_BIG_NUMBER,
          )}
          title="Lowest Health Factor"
          url={
            pageInformation?.lowestHealthFactor?.address
              ? `/your-positions/${pageInformation.lowestHealthFactor.address}/manage`
              : undefined
          }
          value={pageInformation?.lowestHealthFactor?.value?.toFixed(3)}
        />
        <InfoBlock
          title="Next Maturity"
          url={
            pageInformation?.lowestHealthFactor?.address
              ? `/your-positions/${pageInformation?.nearestMaturity?.address}/manage`
              : undefined
          }
          value={
            pageInformation?.nearestMaturity
              ? remainingTime(pageInformation?.nearestMaturity?.value)
              : undefined
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

export default withRequiredConnection(YourPositions)
