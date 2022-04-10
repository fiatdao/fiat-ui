import s from './s.module.scss'
import BigNumber from 'bignumber.js'
import Link from 'next/link'
import { ColumnsType } from 'antd/lib/table/interface'
import cn from 'classnames'
import { ReactNode, useCallback, useState } from 'react'
import { Popover } from 'antd'
import { FIAT_TICKER } from '@/src/constants/misc'
import SafeSuspense from '@/src/components/custom/safe-suspense'
import { useAuctions } from '@/src/hooks/subgraph/useAuctions'
import ButtonGradient from '@/src/components/antd/button-gradient'
import SkeletonTable, { SkeletonTableColumnsType } from '@/src/components/custom/skeleton-table'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import ButtonOutline from '@/src/components/antd/button-outline'
import Element from '@/src/resources/svg/element.svg'
import { Table } from '@/src/components/antd'
import { parseDate, parseTime, tablePagination } from '@/src/utils/table'
import { CellValue } from '@/src/components/custom/cell-value'
import { Asset } from '@/src/components/custom/asset'
import Filter from '@/src/resources/svg/filter.svg'
import { ELEMENT_SUBGRAPH_PROTOCOL, PROTOCOLS, Protocol } from '@/types/protocols'
import { AuctionData } from '@/src/utils/data/auctions'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

type FilterData = Record<Protocol, { active: boolean; name: string; icon: ReactNode }>

const FILTERS: FilterData = {
  Element: { active: false, name: ELEMENT_SUBGRAPH_PROTOCOL, icon: <Element /> },
}

const getParsedActiveFilters = (filters: FilterData) =>
  Object.values(filters)
    .filter(({ active }) => active)
    .map(({ name }) => name) as Protocol[]

const AuctionsTable = ({ columns, filters }: any) => {
  const { auctions } = useAuctions(getParsedActiveFilters(filters))

  return (
    <Table
      columns={columns}
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

const UNKNOWN = 'Unknown'

const Auctions = () => {
  const [filters, setFilters] = useState<FilterData>(FILTERS)
  const { isWalletConnected } = useWeb3Connection()

  const columns: ColumnsType<any> = [
    {
      align: 'left',
      dataIndex: 'protocol',
      render: (protocol: AuctionData['protocol']) => (
        <Asset mainAsset={protocol.name ?? ''} title={protocol.humanReadableName ?? ''} />
      ),
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
      dataIndex: 'endsAt',
      render: (value: Date) => (
        <CellValue bottomValue={parseTime(value)} value={parseDate(value)} />
      ),
      title: 'Ends At',
    },
    {
      align: 'left',
      dataIndex: 'auctionedCollateral',
      render: (value?: BigNumber) => <CellValue value={value?.toFixed(2) ?? UNKNOWN} />,
      title: 'Auctioned Collateral',
    },
    {
      align: 'left',
      dataIndex: 'currentAuctionPrice',
      render: (value?: BigNumber) => (
        <CellValue value={`${value?.toFixed(4) ?? UNKNOWN} ${FIAT_TICKER}`} />
      ),
      title: 'Current Auction Price',
    },
    {
      align: 'left',
      dataIndex: 'faceValue',
      render: (value?: BigNumber) => <CellValue value={`$${value?.toFixed(4) ?? UNKNOWN}`} />,
      title: 'Face Value',
    },
    {
      align: 'left',
      dataIndex: 'apy',
      render: (value: string) => <CellValue value={`${value}%`} />,
      title: 'APY',
    },
    {
      align: 'right',
      dataIndex: 'action',
      render: ({ id, isActive }) =>
        isActive ? (
          <Link href={`/auctions/${id}/buy`} passHref>
            <ButtonGradient disabled={!isWalletConnected}>Buy collateral</ButtonGradient>
          </Link>
        ) : (
          <ButtonGradient disabled>Not Available</ButtonGradient>
        ),
      title: '',
      width: 110,
    },
  ]

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
      <h2 className={cn(s.title)}>Select a collateral asset on auction to buy</h2>
      <div className={cn(s.filters)}>
        {renderFilters()}
        {clearButton()}
      </div>
      <Popover
        arrowContent={false}
        content={
          <>
            <div className={cn(s.filtersGrid)}>{renderFilters()}</div>
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
          <SkeletonTable columns={columns as SkeletonTableColumnsType[]} loading rowCount={2} />
        }
      >
        <AuctionsTable columns={columns} filters={filters} />
      </SafeSuspense>
    </>
  )
}

export default Auctions
