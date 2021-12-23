import { parseDate, remainingTime } from './utils'
import cn from 'classnames'
import { ColumnsType } from 'antd/lib/table/interface'
import { useState } from 'react'
import { Row } from 'antd'
import { SelectValue } from 'antd/lib/select'
import { Text } from '@/src/components/custom/typography'
import { Table } from '@/src/components/antd'
import { Transaction } from '@/src/utils/your-positions-api'
import Select from '@/src/components/antd/select'

const ColumnText = (obj: any) => {
  return (
    <Text className="ml-auto" color="primary" type="p1">
      {obj}
    </Text>
  )
}

const AmountColumn = (amount: any, row: any) => {
  const isIncreasing = amount > row.lastAmount
  const diff = isIncreasing ? amount - row.lastAmount : row.lastAmount - amount
  const text = isIncreasing ? `+${diff}` : `-${diff}`

  return (
    <>
      <Text className="ml-auto" style={{ color: isIncreasing ? 'green' : 'red' }} type="p1">
        {text}
      </Text>
      <Text className="ml-auto" color="primary" type="p1">
        {amount}
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
  { label: 'ePyvUSDC', value: 'ePyvUSDC_12_31_21' },
  { label: 'error', value: 'error' },
]
const ACTIONS_FILTER = [
  { label: 'All Actions', value: 'all' },
  { label: 'Minted', value: 'Minted' },
  { label: 'Error', value: 'error' },
]

type TransactionHistoryProps = {
  transactions?: Transaction[]
}

const TransactionHistoryTable = ({ transactions }: TransactionHistoryProps) => {
  // const [isOpenAssetFilter, setIsOpenAssetFilter] = useState(false)
  const [assetFilter, setAssetFilter] = useState<string>('all')
  // const [isOpenActionFilter, setIsOpenActionFilter] = useState(false)
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(
    transactions || [],
  )

  const onAssetFilterChange = (asset: string) => {
    if (!asset) {
      setAssetFilter('all')
      setFilteredTransactions(transactions || [])
    } else {
      const newFilteredTransactions = transactions?.filter((t) => t.asset.includes(asset))
      setAssetFilter(asset)
      setFilteredTransactions(newFilteredTransactions || [])
    }
  }

  const onActionFilterChange = (asset: string) => {
    if (!asset) {
      setActionFilter('all')
      setFilteredTransactions(transactions || [])
    } else {
      const newFilteredTransactions = transactions?.filter((t) => t.action.includes(asset))
      setActionFilter(asset)
      setFilteredTransactions(newFilteredTransactions || [])
    }
  }

  return (
    <>
      <Row>
        <Select
          allowClear={true}
          defaultOpen
          defaultValue={'all'}
          onSelect={(value: SelectValue) => onAssetFilterChange(value ? value.toString() : '')}
          options={ASSETS_FILTER.map(({ label, value }) => ({
            label,
            value,
            // isActive: value === assetFilter,
          }))}
        />
        <Select
          allowClear={true}
          defaultValue={'all'}
          onSelect={(value: SelectValue) => onActionFilterChange(value ? value.toString() : '')}
          options={ACTIONS_FILTER.map(({ label, value }) => ({
            label,
            value,
            // isActive: value === actionFilter,
          }))}
        />
      </Row>
      <div className={cn('card')}>
        <Table
          columns={Columns}
          dataSource={filteredTransactions}
          inCard
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
      </div>
    </>
  )
}

export default TransactionHistoryTable
