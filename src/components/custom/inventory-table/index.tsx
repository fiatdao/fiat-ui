import cn from 'classnames'
import { ColumnsType } from 'antd/lib/table/interface'
import Link from 'next/link'
import { healthFactor, parseDate, remainingTime } from '@/src/components/custom/tables/utils'
import { Text } from '@/src/components/custom/typography'
import { Table } from '@/src/components/antd'
import { Position } from '@/src/utils/your-positions-api'

const LTVColumn = (ltv: any) => {
  return (
    <Text className="ml-auto" color="primary" type="p1">
      {ltv}%
    </Text>
  )
}

const ColumnText = (obj: any) => {
  return (
    <Text className="ml-auto" color="primary" type="p1">
      {obj}
    </Text>
  )
}

const HealthFactorColumn = (obj: any) => {
  const color = obj ? healthFactor(obj) : 'transparent'

  return (
    <Text className="ml-auto" style={{ color: color }} type="p1">
      {obj}
    </Text>
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

const ActionColumn = (action: Position['action']) => {
  return <Link href={`/your-positions/${action.data.positionId}/manage`}>{action.text}</Link>
}

const Columns: ColumnsType<any> = [
  {
    title: 'Asset',
    dataIndex: 'name',
    width: 150,
    align: 'center',
    render: ColumnText,
  },
  {
    title: 'Discounted Value',
    dataIndex: 'discount',
    width: 150,
    align: 'center',
    render: ColumnText,
  },
  {
    title: 'Max. LTV',
    dataIndex: 'ltv',
    width: 150,
    align: 'center',
    render: LTVColumn,
  },
  {
    title: 'FIAT Minted',
    dataIndex: 'minted',
    width: 150,
    align: 'center',
    render: ColumnText,
  },
  {
    title: 'Maturity',
    dataIndex: 'maturity',
    align: 'center',
    width: 150,
    render: MaturityColumn,
  },
  {
    title: 'Health Factor',
    dataIndex: 'healthFactor',
    align: 'center',
    width: 150,
    render: HealthFactorColumn,
  },
  {
    title: '',
    dataIndex: 'action',
    width: 100,
    align: 'right',
    render: ActionColumn,
  },
]

type InventoryProps = {
  inventory?: Position[]
}

const InventoryTable = ({ inventory }: InventoryProps) => {
  return (
    <div className={cn('card')}>
      <Table
        columns={Columns}
        dataSource={inventory}
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
  )
}

export default InventoryTable
