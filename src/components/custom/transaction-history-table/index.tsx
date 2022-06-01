import s from './s.module.scss'
import { elapsedTime, parseDate } from '@/src/utils/table'
import { Table } from '@/src/components/antd'
import Select from '@/src/components/antd/select'
import { CellValue } from '@/src/components/custom/cell-value'
import { CellAddress } from '@/src/components/custom/cell-address'
import { Asset } from '@/src/components/custom/asset'
import { ACTIONS_TYPES, ActionTransaction, Transaction } from '@/src/utils/data/transactions'
import { tablePagination } from '@/src/utils/table'
import SkeletonTable, { SkeletonTableColumnsType } from '@/src/components/custom/skeleton-table'
import { useTransactionsByUser } from '@/src/hooks/subgraph/useTransactions'
import cn from 'classnames'
import { ColumnsType } from 'antd/lib/table/interface'
import { useEffect, useState } from 'react'
import { SelectValue } from 'antd/lib/select'
import { uniqBy } from 'lodash'

const Columns: ColumnsType<Transaction> = [
  {
    align: 'left',
    dataIndex: 'protocol',
    render: (protocol: Transaction['protocol'], { vaultName }) => (
      <Asset mainAsset={vaultName} title={protocol} />
    ),
    title: 'Protocol',
    width: 200,
  },
  {
    align: 'left',
    dataIndex: 'symbol',
    render: (symbol: Transaction['symbol']) => <CellValue bold value={symbol} />,
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
      // collateral is being deposited when delta is greater than 0, otherwise is a withdrawal operation
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
    render: (obj: Transaction['transactionHash']) => <CellAddress value={obj ?? '-'} />,
    title: 'Transaction Hash',
  },
  {
    align: 'left',
    dataIndex: 'date',
    render: (date: Transaction['date']) => (
      <CellValue bottomValue={elapsedTime(date)} value={parseDate(date)} />
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
  const { data: transactions, loading } = useTransactionsByUser()
  const [assetFilter, setAssetFilter] = useState<string>('all')
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions)

  useEffect(() => {
    const applyFilter = (
      transaction: Transaction,
      property: keyof Transaction,
      value: string,
    ): boolean => {
      if (value === 'all') return true
      return (transaction[property] as string).includes(value)
    }

    if (transactions.length == 0) {
      setFilteredTransactions(transactions)
    } else {
      // TODO: we can use an array of objects with keyof and values
      const newFilteredTransactions = transactions.filter(
        (t) => applyFilter(t, 'asset', assetFilter) && applyFilter(t, 'action', actionFilter),
      )
      setFilteredTransactions(newFilteredTransactions)
    }
  }, [transactions, assetFilter, actionFilter])

  const ASSETS_FILTER = [
    { label: 'All Assets', value: 'all' },
    ...uniqBy(
      transactions.map((transaction) => {
        return { label: transaction.asset, value: transaction.asset }
      }),
      'value',
    ),
  ]

  const onAssetFilterChange = (asset: string) => {
    setAssetFilter(asset)
  }

  const onActionFilterChange = (action: string) => {
    setActionFilter(action)
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
