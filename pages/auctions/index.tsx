import s from './s.module.scss'
import Link from 'next/link'
import { ColumnsType } from 'antd/lib/table/interface'
import cn from 'classnames'
import { ReactNode, useCallback, useState } from 'react'
import { Popover } from 'antd'
import SafeSuspense from '@/src/components/custom/safe-suspense'
import { useAuctions } from '@/src/hooks/subgraph/useAuctions'
import ButtonGradient from '@/src/components/antd/button-gradient'
import SkeletonTable, { SkeletonTableColumnsType } from '@/src/components/custom/skeleton-table'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import ButtonOutline from '@/src/components/antd/button-outline'
import Element from '@/src/resources/svg/element.svg'
import Notional from '@/src/resources/svg/notional.svg'
import { Table } from '@/src/components/antd'
import { tablePagination } from '@/src/utils/table'
import { CellValue } from '@/src/components/custom/cell-value'
import { Asset } from '@/src/components/custom/asset'
import Filter from '@/src/resources/svg/filter.svg'
import { PROTOCOLS, Protocol } from '@/types/protocols'

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
    dataIndex: 'collateralValue',
    render: (value: string) => <CellValue value={`$${value}`} />,
    title: 'Collateral Value',
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
    render: ({ id, isActive }) =>
      isActive ? (
        <Link href={`/auctions/${id}/liquidate`} passHref>
          <ButtonGradient>Liquidate</ButtonGradient>
        </Link>
      ) : (
        <ButtonGradient disabled>Not Available</ButtonGradient>
      ),
    title: '',
    width: 110,
  },
]

type FilterData = Record<Protocol, { active: boolean; name: string; icon: ReactNode }>

const FILTERS: FilterData = {
  Notional: { active: false, name: 'Notional', icon: <Notional /> },
  Element: { active: false, name: 'Element', icon: <Element /> },
}

const getParsedActiveFilters = (filters: FilterData) =>
  Object.values(filters)
    .filter(({ active }) => active)
    .map(({ name }) => name) as Protocol[]

const AuctionsTable = ({ filters }: any) => {
  const { auctions } = useAuctions(getParsedActiveFilters(filters))

  return (
    <Table
      columns={Columns}
      dataSource={auctions}
      loading={false}
      pagination={tablePagination(auctions?.length ?? 0)}
      rowKey="id"
      scroll={{
        x: true,
      }}
    />
  )
}

const Auctions = () => {
  const [filters, setFilters] = useState<FilterData>(FILTERS)

  const areAllFiltersActive = Object.keys(filters).every((s) => filters[s as Protocol].active)

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
        isActive={areAllFiltersActive}
        onClick={() => activateAllFilters()}
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

  const clearButton = () => (
    <button className={cn(s.clear)} onClick={clearAllFilters}>
      Clear
    </button>
  )

  return (
    <>
      <h2 className={cn(s.title)}>Select an asset to liquidate and get profit</h2>
      <div className={cn(s.filters)}>
        {renderFilters()}
        {clearButton()}
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
      <SafeSuspense
        fallback={
          <SkeletonTable columns={Columns as SkeletonTableColumnsType[]} loading rowCount={2} />
        }
      >
        <AuctionsTable filters={filters} />
      </SafeSuspense>
    </>
  )
}

export default Auctions
