import { ColumnsType } from 'antd/lib/table/interface'
import { healthFactor, parseDate, remainingTime } from '@/src/components/custom/tables/utils'
import { Text } from '@/src/components/custom/typography'
import { Table } from '@/src/components/antd'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import { Position } from '@/src/utils/your-positions-api'
import { CellValue } from '@/src/components/custom/cell-value'
import { Asset } from '@/src/components/custom/asset'

const Columns: ColumnsType<any> = [
  {
    align: 'left',
    dataIndex: 'name',
    render: (obj: any) => <Asset mainAsset="SBOND" secondaryAsset="DAI" title={obj} />,
    title: 'Asset',
    width: 200,
  },
  {
    align: 'left',
    dataIndex: 'discount',
    render: (obj: number) => <CellValue bold tooltip={`$${obj}`} value={`$${obj.toFixed(2)}`} />,
    responsive: ['lg'],
    title: 'Discounted Value',
  },
  {
    align: 'left',
    dataIndex: 'ltv',
    render: (obj: number) => <CellValue tooltip={`${obj}%`} value={`${obj.toFixed(2)}%`} />,
    responsive: ['lg', 'xl'],
    title: 'Max. LTV',
  },
  {
    align: 'left',
    dataIndex: 'minted',
    render: (obj: number) => <CellValue tooltip={`${obj}`} value={`${obj.toFixed(3)}`} />,
    responsive: ['xl'],
    title: 'FIAT Minted',
  },
  {
    align: 'left',
    dataIndex: 'maturity',
    render: (date: any) => <CellValue bottomValue={remainingTime(date)} value={parseDate(date)} />,
    responsive: ['xl'],
    title: 'Maturity',
  },
  {
    align: 'left',
    dataIndex: 'healthFactor',
    render: (obj: number) => <CellValue state={healthFactor(obj)} value={`${obj.toFixed(2)}`} />,
    responsive: ['md'],
    title: 'Health Factor',
  },
  {
    align: 'right',
    dataIndex: 'action',
    render: (text: any) => <ButtonOutlineGradient>{text}</ButtonOutlineGradient>,
    title: '',
    width: 110,
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
