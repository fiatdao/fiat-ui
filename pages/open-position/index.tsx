import s from './s.module.scss'
import { ColumnsType } from 'antd/lib/table/interface'
import cn from 'classnames'
import { ReactNode, useCallback, useState } from 'react'
import Popover from '@/src/components/antd/popover'
import { parseDate, remainingTime } from '@/src/components/custom/tables/utils'
import BarnBridge from '@/src/resources/svg/barn-bridge.svg'
import Element from '@/src/resources/svg/element.svg'
import Notional from '@/src/resources/svg/notional.svg'
import { Text } from '@/src/components/custom/typography'
import { Table } from '@/src/components/antd'
import { Tab, Tabs } from '@/src/components/custom'
import ToggleSwitch from '@/src/components/custom/toggle-switch'
import { usePositionsData } from '@/src/hooks/usePositionsData'
import { PROTOCOLS, Protocol } from '@/types'
import { CellValue } from '@/src/components/custom/cell-value'
import { Asset } from '@/src/components/custom/asset'
import ButtonOutline from '@/src/components/antd/button-outline'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import Filter from '@/src/resources/svg/filter.svg'

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
  const areAllFiltersActive = Object.keys(filters).every((s) => filters[s as Protocol].active)

  const setFilter = useCallback((filterName: Protocol, active: boolean) => {
    setFilters((filters) => {
      const filter = filters[filterName]
      return { ...filters, [filterName]: { ...filter, active: active } }
    })
  }, [])

  const toggleAllFilters = useCallback(() => {
    PROTOCOLS.map((asset) => {
      setFilter(asset, !areAllFiltersActive)
    })
  }, [areAllFiltersActive, setFilter])

  const clearAllFilters = useCallback(() => {
    PROTOCOLS.map((asset) => {
      setFilter(asset, false)
    })
  }, [setFilter])

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

  const renderFilters = () => (
    <>
      <ButtonOutline
        height="lg"
        isActive={areAllFiltersActive}
        onClick={() => toggleAllFilters()}
        rounded
      >
        All assets
      </ButtonOutline>
      {PROTOCOLS.map((asset) => {
        return (
          <ButtonOutline
            height="lg"
            isActive={filters[asset].active}
            key={asset}
            onClick={() => setFilter(asset, !filters[asset].active)}
            rounded
          >
            {filters[asset].icon}
            {asset}
          </ButtonOutline>
        )
      })}
    </>
  )

  return (
    <>
      <h2 className={cn(s.title)}>Select a collateral type to add to your FIAT positions</h2>
      <Tabs>
        {tabs.map(({ children, key }, index) => (
          <Tab isActive={key === activeTabKey} key={index} onClick={() => setActiveTabKey(key)}>
            {children}
          </Tab>
        ))}
      </Tabs>
      <Popover
        arrowContent={false}
        content={
          <>
            <div className={cn(s.fitersGrid)}>{renderFilters()}</div>
            <div className={cn(s.buttonContainer)}>
              <button className={cn(s.clear)} onClick={clearAllFilters}>
                Clear
              </button>
            </div>
          </>
        }
        placement="bottomRight"
        trigger="click"
      >
        <ButtonOutlineGradient className={cn(s.filtersButton)} height="lg">
          Filter
          <Filter />
        </ButtonOutlineGradient>
      </Popover>
      <div className={cn(s.filters)}>
        {renderFilters()}
        <ToggleSwitch
          checked={inMyWallet}
          className={cn(s.switch)}
          label="In my wallet"
          onChange={() => {
            setInMyWallet(!inMyWallet)
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
    </>
  )
}

export default OpenPosition
