import s from './s.module.scss'
import { ColumnsType } from 'antd/lib/table/interface'
import cn from 'classnames'
import { ReactNode, useCallback, useState } from 'react'
import { Popover } from 'antd'
import { useAuctionData } from '@/src/hooks/useAuctionData'
import SkeletonTable, { SkeletonTableColumnsType } from '@/pages/auctions/skeleton-table'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import ButtonOutline from '@/src/components/antd/button-outline'
import BarnBridge from '@/src/resources/svg/barn-bridge.svg'
import Element from '@/src/resources/svg/element.svg'
import Notional from '@/src/resources/svg/notional.svg'
import { Text } from '@/src/components/custom/typography'
import { Table } from '@/src/components/antd'
import { Grid } from '@/src/components/custom'
import ToggleSwitch from '@/src/components/custom/toggle-switch'
import { PROTOCOLS, Protocol } from '@/types'
import { CellValue } from '@/src/components/custom/cell-value'
import { Asset } from '@/src/components/custom/asset'
import Filter from '@/src/resources/svg/filter.svg'

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
    dataIndex: 'asset',
    render: (value: string) => <CellValue value={value} />,
    title: 'Asset',
  },
  {
    align: 'left',
    dataIndex: 'upForAuction',
    render: (value: any) => <CellValue value={value} />,
    title: 'Up for Auction',
  },
  {
    align: 'left',
    dataIndex: 'price',
    render: (value: string) => <CellValue value={`$${value}`} />,
    title: 'Auction Price',
  },
  {
    align: 'left',
    dataIndex: 'currentValue',
    render: (value: string) => <CellValue value={`$${value}`} />,
    title: 'Current Value',
  },
  {
    align: 'left',
    dataIndex: 'profit',
    render: (value: string) => <CellValue value={`${value}%`} />,
    title: 'Profit',
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

const Auctions = () => {
  const [filters, setFilters] = useState<FilterData>(FILTERS)
  const [inMyWallet, setInMyWallet] = useState(false)

  //const areAllFiltersActive = Object.keys(filters).every((s) => filters[s as Protocol].active)

  const { data, error, loading } = useAuctionData()

  const setFilter = useCallback((filterName: Protocol, active: boolean) => {
    setFilters((filters) => {
      const filter = filters[filterName]
      return { ...filters, [filterName]: { ...filter, active: active } }
    })
  }, [])

  const activateAllFilters = useCallback(() => {
    PROTOCOLS.map((asset) => {
      setFilter(asset, true)
    })
  }, [setFilter])

  const clearAllFilters = useCallback(() => {
    PROTOCOLS.map((asset) => {
      setFilter(asset, false)
    })
  }, [setFilter])

  const renderFilters = () => (
    <>
      <ButtonOutline
        height="lg"
        // isActive={areAllFiltersActive}
        onClick={() => activateAllFilters()}
        rounded
      >
        All assets
      </ButtonOutline>
      {PROTOCOLS.map((asset) => {
        return (
          <ButtonOutline
            height="lg"
            // isActive={filters[asset].active}
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

  const clearButton = () => (
    <button className={cn(s.clear)} onClick={clearAllFilters}>
      Clear
    </button>
  )

  return (
    <Grid flow="row" rowsTemplate="1fr auto">
      <Text color="secondary" font="secondary" type="p1" weight="semibold">
        Select an asset to liquidate and get profit
      </Text>
      <div className={cn(s.filters)}>
        {renderFilters()}
        {clearButton()}
        <ToggleSwitch
          checked={inMyWallet}
          label="In my wallet"
          onChange={(e) => {
            setInMyWallet(e)
          }}
        />
      </div>
      <Popover
        arrowContent={false}
        content={
          <>
            <div className={cn(s.fitersGrid)}>{renderFilters()}</div>
            <div className={cn(s.buttonContainer)}>{clearButton()}</div>
          </>
        }
        placement="bottomLeft"
        trigger="click"
      >
        <ButtonOutlineGradient className={cn(s.filtersButton)} height="lg">
          Filter
          <Filter />
        </ButtonOutlineGradient>
      </Popover>

      {!error && (
        <SkeletonTable columns={Columns as SkeletonTableColumnsType[]} loading={loading}>
          <Table
            columns={Columns}
            dataSource={data}
            loading={false}
            pagination={{
              total: data?.length,
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
            rowKey="id"
            scroll={{
              x: true,
            }}
          />
        </SkeletonTable>
      )}
    </Grid>
  )
}

export default Auctions
