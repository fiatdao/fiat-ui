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
import { Col, Row } from 'antd'
import { Text } from '@/src/components/custom/typography'
import { Grid, Tabs } from '@/src/components/custom'
import { WrapperContent } from '@/src/components/custom/wrapper-content'
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
    <Grid flow="row" rowsTemplate="1fr auto">
      <Row>
        {!isLoadingPage && (
          <>
            <Col className={s.card} span={5}>
              <Text className={s.title} type="small">
                Total Debt
              </Text>
              <Text type="h3" weight="bold">
                {yourPosition?.totalDebt}
              </Text>
            </Col>
            <Col className={s.card} span={5}>
              <Text className={s.title} type="small">
                Current Value
              </Text>
              <Text type="h3" weight="bold">
                {yourPosition?.currentValue}
              </Text>
            </Col>
            <Col className={s.card} span={5}>
              <Text className={s.title} type="small">
                Lowest Health Factor
              </Text>
              <Text type="h3" weight="bold">
                {yourPosition?.lowestHealthFactor}
              </Text>
            </Col>
            <Col className={s.card} span={5}>
              <Text className={s.title} type="small">
                Next Maturity
              </Text>
              <Text type="h3" weight="bold">
                {yourPosition?.nextMaturity}
              </Text>
            </Col>
          </>
        )}
      </Row>
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
    </Grid>
  )
}

export default YourPositions
