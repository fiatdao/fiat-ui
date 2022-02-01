import s from './s.module.scss'
import { ColumnsType } from 'antd/lib/table/interface'
import cn from 'classnames'
import { ReactNode, useCallback, useState } from 'react'
import { parseDate, remainingTime } from '@/src/components/custom/tables/utils'
import BarnBridge from '@/src/resources/svg/barn-bridge.svg'
import Element from '@/src/resources/svg/element.svg'
import Notional from '@/src/resources/svg/notional.svg'
import { Text } from '@/src/components/custom/typography'
import { Table } from '@/src/components/antd'
import { Grid, Tab, Tabs } from '@/src/components/custom'
import ToggleSwitch from '@/src/components/custom/toggle-switch'
import { usePositionsData } from '@/src/hooks/usePositionsData'
import { PROTOCOLS, Protocol } from '@/types'
import { CellValue } from '@/src/components/custom/cell-value'
import { Asset } from '@/src/components/custom/asset'
import ButtonOutline from '@/src/components/antd/button-outline'

const getDateState = () => {
  // we sould decide which state to show here
  const state = 'ok'

  return state === 'ok'
    ? 'ok'
    : state === 'warning'
    ? 'warning'
    : state === 'danger'
    ? 'danger'
    : undefined
}

const Columns: ColumnsType<any> = [
  {
    align: 'left',
    dataIndex: 'protocol',
    render: (obj: any) => <Asset mainAsset="SBOND" secondaryAsset="DAI" title={obj} />,
    title: 'Protocol',
    width: 200,
  },
  {
    align: 'left',
    dataIndex: 'collateral',
    render: (value: string) => <CellValue value={value} />,
    title: 'Asset',
  },
  {
    align: 'left',
    dataIndex: 'maturity',
    render: (date: any) => (
      <CellValue
        bottomValue={parseDate(date)}
        state={getDateState()}
        value={`${remainingTime(date)} Left`}
      />
    ),
    title: 'Maturity',
  },
  {
    align: 'left',
    dataIndex: 'faceValue',
    render: (value: string) => <CellValue value={`$${value}`} />,
    title: 'Face Value',
  },
  {
    align: 'left',
    dataIndex: 'currentValue',
    render: (value: string) => <CellValue value={`$${value}`} />,
    title: 'Current Value',
  },
  {
    align: 'right',
    dataIndex: 'action',
    render: (value: string) => value,
    title: '',
    width: 110,
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
    <Grid flow="row" rowsTemplate="1fr auto">
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
      <div className={cn(s.filters)}>
        <ButtonOutline
          height="lg"
          isActive={Object.keys(filters).every((s) => filters[s as Protocol].active)}
          onClick={() => activateFilter(null)}
          rounded
        >
          All assets
        </ButtonOutline>
        {PROTOCOLS.map((asset) => {
          return (
            <ButtonOutline
              height="lg"
              icon={filters[asset].icon}
              isActive={filters[asset].active}
              key={asset}
              onClick={() => activateFilter(asset)}
              rounded
            >
              {asset}
            </ButtonOutline>
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
      <Table
        columns={Columns}
        dataSource={data}
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
    </Grid>
  )
}

export default OpenPosition
