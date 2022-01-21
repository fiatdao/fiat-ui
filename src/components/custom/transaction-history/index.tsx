import s from './s.module.scss'
import cn from 'classnames'
import { ColumnsType } from 'antd/lib/table/interface'
import { useState } from 'react'
import { SelectValue } from 'antd/lib/select'
import { parseDate, remainingTime } from '@/src/components/custom/tables/utils'
import { Text } from '@/src/components/custom/typography'
import { Table } from '@/src/components/antd'
import { PositionTransaction } from '@/src/utils/your-positions-api'
import Select from '@/src/components/antd/select'

const ColumnText = (obj: any) => {
  return (
    <Text className="ml-auto" color="primary" type="p1">
      {obj}
    </Text>
  )
}

const AmountColumn = (amount: any, row: any) => {
  const delta = row.deltaAmount || 0
  let isIncreasing = false
  let diff = amount

  if (row.action === 'MINT') {
    isIncreasing = true
    diff -= delta
  }
  const text = isIncreasing ? `+${delta}` : `-${delta}`

  return (
    <>
      <Text className="ml-auto" style={{ color: isIncreasing ? 'green' : 'red' }} type="p1">
        {text}
      </Text>
      <Text className="ml-auto" color="primary" type="p1">
        {diff}
      </Text>
    </>
  )
}

const MaturityColumn = (date: any) => {
  const parsedDate = parseDate(date)
  const countdown = remainingTime(date)

  return (
    <>
      <Text className="ml-auto" color="primary" type="p1">
        {parsedDate}
      </Text>
      <Text className="ml-auto" color="primary" type="p1">
        {countdown}
      </Text>
    </>
  )
}

const Columns: ColumnsType<any> = [
  {
    title: 'Asset',
    dataIndex: 'asset',
    width: 150,
    align: 'center',
    render: ColumnText,
  },
  {
    title: 'Action',
    dataIndex: 'action',
    width: 150,
    align: 'center',
    render: ColumnText,
  },
  {
    title: 'Amount',
    dataIndex: 'amount',
    width: 150,
    align: 'center',
    render: AmountColumn,
  },
  {
    title: 'Transaction Hast',
    dataIndex: 'transactionHash',
    width: 150,
    align: 'center',
    render: ColumnText,
  },
  {
    title: 'Date',
    dataIndex: 'date',
    align: 'center',
    width: 150,
    render: MaturityColumn,
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
        pagination={{
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

export default TransactionHistoryTable
