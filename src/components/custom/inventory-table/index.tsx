import { ColumnsType } from 'antd/lib/table/interface'
import Link from 'next/link'
import ButtonGradient from '@/src/components/antd/button-gradient'
import {
  calculateHealthFactor,
  parseDate,
  remainingTime,
} from '@/src/components/custom/tables/utils'
import { Text } from '@/src/components/custom/typography'
import { Table } from '@/src/components/antd'
import { CellValue } from '@/src/components/custom/cell-value'
import { Asset } from '@/src/components/custom/asset'
import { PositionsAtRiskTableWrapper } from '@/src/components/custom/positions-at-risk-table-wrapper'
import { Position } from '@/src/utils/data/positions'

const Columns: ColumnsType<Position> = [
  {
    align: 'left',
    dataIndex: 'name',
    render: (name: Position['protocol']) => (
      <Asset mainAsset="SBOND" secondaryAsset="DAI" title={name} />
    ),
    title: 'Asset',
    width: 200,
  },
  {
    align: 'left',
    dataIndex: 'totalCollateral',
    render: (discount: Position['totalCollateral']) => (
      <CellValue bold tooltip={`$${discount}`} value={`$${discount.toFixed(2)}`} />
    ),
    responsive: ['lg'],
    title: 'Collateral Value',
  },
  {
    align: 'left',
    dataIndex: 'totalCollateral',
    render: (ltv: Position['totalCollateral']) => (
      <CellValue tooltip={`${ltv}%`} value={`${ltv.toNumber().toFixed(2)}%`} />
    ),
    responsive: ['lg', 'xl'],
    title: 'Max. LTV',
  },
  {
    align: 'left',
    dataIndex: 'totalNormalDebt',
    render: (minted: Position['totalNormalDebt']) => (
      <CellValue tooltip={`${minted}`} value={`${minted.toNumber().toFixed(3)}`} />
    ),
    responsive: ['xl'],
    title: 'FIAT Minted',
  },
  {
    align: 'left',
    dataIndex: 'maturity',
    render: (maturity: Position['maturity']) => (
      <CellValue bottomValue={remainingTime(maturity)} value={parseDate(maturity)} />
    ),
    responsive: ['xl'],
    title: 'Maturity',
  },
  {
    align: 'left',
    dataIndex: 'healthFactor',
    render: (healthFactor: Position['healthFactor']) => (
      <CellValue state={calculateHealthFactor(healthFactor)} value={`${healthFactor.toFixed(2)}`} />
    ),
    responsive: ['md'],
    title: 'Health Factor',
  },
  {
    align: 'right',
    dataIndex: 'id', // FIXME Check on chain this
    render: (id) => (
      <Link href={`/your-positions/${id}/manage`} passHref>
        <ButtonGradient>Manage</ButtonGradient>
      </Link>
    ),
    title: '',
    width: 110,
  },
]

type InventoryProps = {
  inventory?: Position[]
}

const InventoryTable = ({ inventory }: InventoryProps) => {
  return (
    <>
      <PositionsAtRiskTableWrapper>
        <Table columns={Columns} dataSource={inventory} loading={false} rowKey="address" />
      </PositionsAtRiskTableWrapper>
      <Table
        columns={Columns}
        dataSource={inventory}
        loading={false}
        pagination={{
          current: 1,
          pageSize: 10,
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
        rowKey="name"
        scroll={{
          x: true,
        }}
      />
    </>
  )
}

export default InventoryTable
