import s from './s.module.scss'
import cn from 'classnames'
import { ColumnsType } from 'antd/lib/table/interface'
import { useState } from 'react'
import { SelectValue } from 'antd/lib/select'
import _ from 'lodash'
import { parseDate, remainingTime } from '@/src/utils/table'
import { Table } from '@/src/components/antd'
import Select from '@/src/components/antd/select'
import { CellValue } from '@/src/components/custom/cell-value'
import { CellAddress } from '@/src/components/custom/cell-address'
import { Asset } from '@/src/components/custom/asset'
import { ACTIONS_TYPES, ActionTransaction, Transaction } from '@/src/utils/data/transactions'
import { tablePagination } from '@/src/utils/table'
import SkeletonTable, { SkeletonTableColumnsType } from '@/src/components/custom/skeleton-table'
import { shortenAddr } from '@/src/web3/utils'
import { useTransactionsByUser } from '@/src/hooks/subgraph/useTransactions'
import { getTokenByAddress } from '@/src/constants/bondTokens'

const Columns: ColumnsType<any> = [
  {
    align: 'left',
    render: (obj: Transaction) => (
      <Asset
        mainAsset={obj.vaultName}
        secondaryAsset={obj.underlierSymbol}
        title={getTokenByAddress(obj.assetAddress)?.symbol ?? '-'}
      />
    ),
    title: 'Asset',
    width: 200,
  },
  {
    align: 'left',
    dataIndex: 'action',
    render: (value: Transaction['action']) => <CellValue value={`${ACTIONS_TYPES[value]}`} />,
    responsive: ['lg'],
    title: 'Action',
  },
  {
    align: 'right',
    dataIndex: 'deltaAmount',
    render: (delta: Transaction['amount']) => {
      // collateral is being depositted when delta is greater than 0, otherwise is a withdraw operation
      const isAdding = delta >= 0
      const text = isAdding ? `+${delta.toFixed(3)}` : `${delta.toFixed(3)}`

      return (
        <CellValue
          // bottomValue={`$${delta.toFixed(2)}`} @TODO: show USDC value of collateral! fairPrice * amount
          state={isAdding ? 'ok' : 'danger'}
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
    render: (obj: Transaction['transactionHash']) => (
      <CellAddress value={shortenAddr(obj) ?? '-'} />
    ),
    title: 'Transaction Hash',
  },
  {
    align: 'left',
    dataIndex: 'date',
    render: (date: Transaction['date']) => (
      <CellValue bottomValue={remainingTime(date)} value={parseDate(date)} />
    ),
    responsive: ['lg'],
    title: 'Date',
  },
]

const ACTIONS_FILTER = [
  { label: 'All Actions', value: 'all' },
  ...Object.keys(ACTIONS_TYPES).map((action) => {
    return { label: ACTIONS_TYPES[action as ActionTransaction], value: action }
  }),
]

const TransactionHistoryTable = () => {
  // TODO: properly use `assetFilter` and `actionFilter` from the state
  const [assetFilter, setAssetFilter] = useState<string>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const { data: transactions, loading } = useTransactionsByUser()

  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions)

  const ASSETS_FILTER = [
    { label: 'All Assets', value: 'all' },
    ..._.uniqBy(
      transactions.map((s) => {
        const tokenMetadata = getTokenByAddress(s.assetAddress)
        return { label: tokenMetadata?.symbol ?? s.asset, value: s.asset }
      }),
      'value',
    ),
  ]

  const applyFilter = (
    transaction: Transaction,
    property: keyof Transaction,
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
      <SkeletonTable
        columns={Columns as SkeletonTableColumnsType[]}
        loading={!filteredTransactions}
        rowCount={2}
      >
        <Table
          columns={Columns}
          dataSource={filteredTransactions}
          loading={loading}
          pagination={tablePagination(filteredTransactions?.length ?? 0)}
          rowKey="address"
          scroll={{
            x: true,
          }}
        />
      </SkeletonTable>
    </>
  )
}

export default TransactionHistoryTable
