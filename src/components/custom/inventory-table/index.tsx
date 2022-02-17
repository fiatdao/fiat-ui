import { ColumnsType } from 'antd/lib/table/interface'
import Link from 'next/link'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { calculateHealthFactor, parseDate, remainingTime } from '@/src/utils/table'
import { Table } from '@/src/components/antd'
import { CellValue } from '@/src/components/custom/cell-value'
import SkeletonTable, { SkeletonTableColumnsType } from '@/pages/auctions/skeleton-table'
import { Asset } from '@/src/components/custom/asset'
import { PositionsAtRiskTableWrapper } from '@/src/components/custom/positions-at-risk-table-wrapper'
import { Position } from '@/src/utils/data/positions'
import { tablePagination } from '@/src/utils/table'

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
    dataIndex: 'discount',
    render: (discount: Position['discount']) => (
      <CellValue bold tooltip={`$${discount}`} value={`$${discount.toNumber().toFixed(2)}`} />
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
      <SkeletonTable
        columns={Columns as SkeletonTableColumnsType[]}
        loading={!inventory}
        rowCount={2}
      >
        <Table
          columns={Columns}
          dataSource={inventory}
          loading={false}
          pagination={tablePagination(inventory?.length ?? 0)}
          rowKey="name"
          scroll={{
            x: true,
          }}
        />
      </SkeletonTable>
    </>
  )
}

export default InventoryTable
