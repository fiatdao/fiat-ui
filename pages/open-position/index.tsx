import s from './s.module.scss'
import { ColumnsType } from 'antd/lib/table/interface'
import cn from 'classnames'

import { ReactNode, useCallback, useState } from 'react'
import { Button } from 'antd'
import BarnBridge from '@/src/resources/svg/barn-bridge.svg'
import Element from '@/src/resources/svg/element.svg'
import Notional from '@/src/resources/svg/notional.svg'
import { Text } from '@/src/components/custom/typography'
import { Table } from '@/src/components/antd'
import { Grid, Tab, Tabs } from '@/src/components/custom'
import { WrapperContent } from '@/src/components/custom/wrapper-content'
import ToggleSwitch from '@/src/components/custom/toggle-switch'
import { usePositionsData } from '@/src/hooks/usePositionsData'
import { PROTOCOLS, Protocol } from '@/types'

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
    render: (value: Date) => (
      <Text className="ml-auto" color="primary" type="p1">
        {value.toString()}
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

type FilterData = Record<Protocol, { active: boolean; name: string; icon: ReactNode }>

const FILTERS: FilterData = {
  BarnBridge: { active: false, name: 'BarnBridge', icon: <BarnBridge /> },
  Notional: { active: false, name: 'Notional', icon: <Notional /> },
  Element: { active: false, name: 'Element', icon: <Element /> },
}

const OpenPosition = () => {
  const [activeTabKey, setActiveTabKey] = useState('byIssuer')
  const [filters, setFilters] = useState<FilterData>(FILTERS)
  const [inMyWallet, setInMyWallet] = useState(false)

  const data = usePositionsData()

  const activateFilter = useCallback((filterName: Protocol | null) => {
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

  enum TabState {
    ByIssuer = 'byIssuer',
    ByAsset = 'byAsset',
  }

  const tabs = [
    {
      key: TabState.ByIssuer,
      children: 'By Issuer',
    },
    {
      key: TabState.ByAsset,
      children: 'By Underlying',
    },
  ]

  return (
    <WrapperContent>
      <Grid flow="row" rowsTemplate="1fr auto">
        <div className="card-header">
          <Text color="secondary" font="secondary" type="p1" weight="semibold">
            Select a collateral type to add to your FIAT positions
          </Text>
          <Tabs>
            {tabs.map(({ children, key }, index) => (
              <Tab isActive={key === activeTabKey} key={index} onClick={() => setActiveTabKey(key)}>
                {children}
              </Tab>
            ))}
          </Tabs>
          {/* <Tabs
            activeKey={activeTabKey}
            onClick={setActiveTabKey}
            tabs={}
          ></Tabs> */}
        </div>
        <div className={cn(s.filterWrapper)}>
          <Button
            className={cn(s.pill, {
              [s.active]: Object.keys(filters).every((s) => filters[s as Protocol].active),
            })}
            onClick={() => activateFilter(null)}
            shape="round"
            size="large"
            type="primary"
          >
            All assets
          </Button>
          {PROTOCOLS.map((asset) => {
            return (
              <Button
                className={cn(s.pill, {
                  [s.active]: filters[asset].active,
                })}
                icon={filters[asset].icon}
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
          <ToggleSwitch
            checked={inMyWallet}
            label="In my wallet"
            onChange={(e) => {
              setInMyWallet(e.target.checked)
            }}
          />
        </div>
        <div className={cn('card')}>
          <Table
            columns={Columns}
            dataSource={data}
            inCard
            loading={false}
            pagination={{
              total: data.length,
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
