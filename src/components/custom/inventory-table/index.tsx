import cn from 'classnames'
import { ColumnsType } from 'antd/lib/table/interface'
import { healthFactor, parseDate, remainingTime } from '@/src/components/custom/tables/utils'
import { Text } from '@/src/components/custom/typography'
import { Table } from '@/src/components/antd'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import { Position } from '@/src/utils/your-positions-api'

const LTVColumn = (ltv: any) => {
  return (
    <>
      <Text className="ml-auto" color="primary" type="p1">
        {ltv}%
      </Text>
    </>
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

const ActionColumn = (text: any) => {
  return <ButtonOutlineGradient>{text}</ButtonOutlineGradient>
}

const Columns: ColumnsType<any> = [
  {
    align: 'left',
    dataIndex: 'name',
    render: ColumnText,
    title: 'Asset',
    width: 150,
  },
  {
    align: 'left',
    dataIndex: 'discount',
    render: ColumnText,
    title: 'Discounted Value',
    width: 150,
  },
  {
    align: 'left',
    dataIndex: 'ltv',
    render: LTVColumn,
    title: 'Max. LTV',
    width: 150,
  },
  {
    align: 'left',
    dataIndex: 'minted',
    render: ColumnText,
    title: 'FIAT Minted',
    width: 150,
  },
  {
    align: 'left',
    dataIndex: 'maturity',
    render: MaturityColumn,
    title: 'Maturity',
    width: 150,
  },
  {
    align: 'left',
    dataIndex: 'healthFactor',
    render: HealthFactorColumn,
    title: 'Health Factor',
    width: 150,
  },
  {
    align: 'right',
    dataIndex: 'action',
    render: ActionColumn,
    title: '',
    width: 100,
  },
]

type InventoryProps = {
  inventory?: Position[]
}

const InventoryTable = ({ inventory }: InventoryProps) => {
  return (
    <Table
      columns={Columns}
      dataSource={inventory}
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
  )
}

export default InventoryTable
