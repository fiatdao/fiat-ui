import s from './s.module.scss'
import { ColumnsType } from 'antd/lib/table/interface'
import cn from 'classnames'

import { useCallback, useState } from 'react'
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

const ALL_ASSETS = ['BarnBridge', 'Notional', 'Element'] as const
type Assets = typeof ALL_ASSETS[number]
type FilterData = Record<Assets, { active: boolean; name: string }>

const FILTERS: FilterData = {
  BarnBridge: { active: false, name: 'BarnBridge' },
  Notional: { active: false, name: 'Notional' },
  Element: { active: false, name: 'Element' },
}

const OpenPosition = () => {
  const [activeTabKey, setActiveTabKey] = useState('byIssuer')
  const [filters, setFilters] = useState<FilterData>(FILTERS)

  console.log(filters)
  const activateFilter = useCallback((filterName: Assets | null) => {
    if (filterName === null) {
      setFilters(FILTERS)
      return
    }
    setFilters((filters) => {
      const filter = filters[filterName]
      const active = { ...filter, active: !filter.active }
      return { ...filters, [filterName]: active }
    })
  }, [])

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
        <div className={cn(s.filterWrapper)}>
          <Button
            className={cn(s.pill, {
              [s.active]: Object.keys(filters).every((s) => filters[s as Assets].active),
            })}
            onClick={() => activateFilter(null)}
            shape="round"
            size="large"
            type="primary"
          >
            All assets
          </Button>
          {ALL_ASSETS.map((asset) => {
            return (
              <Button
                className={cn(s.pill, {
                  [s.active]: filters[asset].active,
                })}
                key={asset}
                onClick={() => activateFilter(asset)}
                shape="round"
                size="large"
                type="primary"
              >
                {asset}
              </Button>
            )
          })}
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
