import { ColumnsType } from 'antd/lib/table/interface'
import cn from 'classnames'

import { useState } from 'react'
import { Button } from 'antd'
import { Text } from '@/src/components/custom/typography'
import { Table } from '@/src/components/antd'
import { Grid, Tabs } from '@/src/components/custom'
import { WrapperContent } from '@/src/components/custom/wrapper-content'

const data = [
  {
    protocol: 'BarnBridge',
    collateral: 'bb_sBOND...',
    maturity: '0',
    faceValue: '0',
    currentValue: '0',
    action: <Button>Test</Button>,
  },
]

const total = 924

const Columns: ColumnsType<any> = [
  {
    title: 'Protocol',
    dataIndex: 'protocol',
    width: 150,
    align: 'right',
    render: (value: string) => (
      <Text className="ml-auto" color="primary" type="p1">
        {value}
      </Text>
    ),
  },
  {
    title: 'Collateral',
    dataIndex: 'collateral',
    width: 150,
    align: 'right',
    render: (value: string) => (
      <Text className="ml-auto" color="primary" type="p1">
        {value}
      </Text>
    ),
  },
  {
    title: 'Maturity',
    dataIndex: 'maturity',
    width: 150,
    align: 'right',
    render: (value: string) => (
      <Text className="ml-auto" color="primary" type="p1">
        {value}
      </Text>
    ),
  },
  {
    title: 'Face Value',
    dataIndex: 'faceValue',
    width: 150,
    align: 'right',
    render: (value: string) => (
      <Text className="ml-auto" color="primary" type="p1">
        {value}
      </Text>
    ),
  },
  {
    title: 'Current Value',
    dataIndex: 'currentValue',
    width: 150,
    align: 'right',
    render: (value: string) => (
      <Text className="ml-auto" color="primary" type="p1">
        {value}
      </Text>
    ),
  },
  {
    title: '',
    dataIndex: 'action',
    width: 150,
    align: 'right',
    render: (value: string) => (
      <Text className="ml-auto" color="primary" type="p1">
        {value}
      </Text>
    ),
  },
]

const OpenPosition = () => {
  const [activeTabKey, setActiveTabKey] = useState('byIssuer')
  return (
    <WrapperContent>
      <Grid flow="row" rowsTemplate="1fr auto">
        <div className="card-header">
          <Text color="secondary" font="secondary" type="p1" weight="semibold">
            Select a collateral type to add to your FIAT positions
          </Text>
          <Tabs
            activeKey={activeTabKey}
            onClick={setActiveTabKey}
            tabs={[
              {
                id: 'byIssuer',
                children: (
                  <Text color="secondary" type="p1">
                    By Issuer
                  </Text>
                ),
              },
              {
                id: 'byAsset',
                children: (
                  <Text color="secondary" type="p1">
                    By Underlying
                  </Text>
                ),
              },
            ]}
          ></Tabs>
        </div>
        <div className={cn('card')}>
          <Table
            columns={Columns}
            dataSource={data}
            inCard
            loading={false}
            pagination={{
              total,
              pageSize: 10,
              current: 1,
              position: ['bottomRight'],
              showTotal: (total: number, [from, to]: [number, number]) => (
                <>
                  <Text className="hidden-mobile" color="secondary" type="p2" weight="semibold">
                    Showing {from} to {to} the most recent {total}
                  </Text>
                  <Text
                    className="hidden-tablet hidden-desktop"
                    color="secondary"
                    type="p2"
                    weight="semibold"
                  >
                    {from}..{to} of {total}
                  </Text>
                </>
              ),
              onChange: (page: number, pageSize: number) => {
                console.log(page, pageSize)
              },
            }}
            rowKey="address"
            scroll={{
              x: true,
            }}
          />
        </div>
      </Grid>
    </WrapperContent>
  )
}

export default OpenPosition
