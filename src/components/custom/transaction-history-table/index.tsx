import s from './s.module.scss'
import cn from 'classnames'
import { ColumnsType } from 'antd/lib/table/interface'
import { useState } from 'react'
import { SelectValue } from 'antd/lib/select'
import { parseDate, remainingTime } from '@/src/utils/table'
import { Table } from '@/src/components/antd'
import Select from '@/src/components/antd/select'
import { CellValue } from '@/src/components/custom/cell-value'
import { CellAddress } from '@/src/components/custom/cell-address'
import { Asset } from '@/src/components/custom/asset'
import { PositionTransaction } from '@/src/utils/data/positionTransaction'
import { tablePagination } from '@/src/utils/table'

const Columns: ColumnsType<any> = [
  {
    align: 'left',
    dataIndex: 'asset',
    render: (obj: any) => <Asset mainAsset="SBOND" secondaryAsset="DAI" title={obj} />,
    title: 'Asset',
    width: 200,
  },
  {
    align: 'left',
    dataIndex: 'action',
    render: (obj: any) => <CellValue value={`${obj}`} />,
    responsive: ['lg'],
    title: 'Action',
  },
  {
    align: 'right',
    dataIndex: 'amount',
    render: (amount: any, row: any) => {
      const delta = (row.deltaAmount || 0).toFixed(3)
      const mint = row.action === 'MINT'
      const diff = mint ? amount - delta : amount
      const text = mint ? `+${delta}` : `-${delta}`

      return (
        <CellValue
          bottomValue={`$${diff.toFixed(2)}`}
          state={mint ? 'ok' : 'danger'}
          value={text}
        />
      )
    },
    responsive: ['lg'],
    title: 'Amount',
  },
  {
    align: 'left',
    dataIndex: 'transactionHash',
    render: (obj: any) => <CellAddress value={obj.substring(0, obj.search('-'))} />,
    title: 'Transaction Hash',
  },
  {
    align: 'left',
    dataIndex: 'date',
    render: (date: any) => <CellValue bottomValue={remainingTime(date)} value={parseDate(date)} />,
    responsive: ['lg'],
    title: 'Date',
  },
]

const ASSETS_FILTER = [
  { label: 'All Assets', value: 'all' },
  { label: 'ePyvUSDC', value: 'Principal Token eyUSDC:10-AUG-22-GMT' },
  { label: 'Error', value: 'error' },
]

const ACTIONS_FILTER = [
  { label: 'All Actions', value: 'all' },
  { label: 'Minted', value: 'MINT' },
  { label: 'Error', value: 'error' },
]

type TransactionHistoryProps = {
  transactions?: PositionTransaction[]
}

const TransactionHistoryTable = ({ transactions }: TransactionHistoryProps) => {
  // TODO: properly use `assetFilter` and `actionFilter` from the state
  const [assetFilter, setAssetFilter] = useState<string>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [filteredTransactions, setFilteredTransactions] = useState<PositionTransaction[]>(
    transactions || [],
  )

  const applyFilter = (
    transaction: PositionTransaction,
    property: keyof PositionTransaction,
    value: string,
  ): boolean => {
    if (value === 'all') return true
    return (transaction[property] as string).includes(value)
  }

  const applyFilters = (filters: string[]) => {
    if (transactions) {
      // TODO: we can use an array of objects with keyof and values
      const newFilteredTransactions = transactions.filter(
        (t) => applyFilter(t, 'asset', filters[0]) && applyFilter(t, 'action', filters[1]),
      )
      setFilteredTransactions(newFilteredTransactions)
    }
  }

  const onAssetFilterChange = (asset: string) => {
    setAssetFilter(asset)
    applyFilters([asset, actionFilter])
  }

  const onActionFilterChange = (action: string) => {
    setActionFilter(action)
    applyFilters([assetFilter, action])
  }

  return (
    <>
      <div className={cn(s.filters)}>
        <Select
          className={cn(s.filter)}
          defaultValue={'all'}
          onSelect={(value: SelectValue) => onAssetFilterChange(value ? value.toString() : '')}
          options={ASSETS_FILTER.map(({ label, value }) => ({
            label,
            value,
          }))}
        />
        <Select
          className={cn(s.filter)}
          defaultValue={'all'}
          onSelect={(value: SelectValue) => onActionFilterChange(value ? value.toString() : '')}
          options={ACTIONS_FILTER.map(({ label, value }) => ({
            label,
            value,
          }))}
        />
      </div>
      <Table
        columns={Columns}
        dataSource={filteredTransactions}
        loading={false}
        pagination={tablePagination(filteredTransactions?.length ?? 0)}
        rowKey="address"
        scroll={{
          x: true,
        }}
      />
    </>
  )
}

export default TransactionHistoryTable
