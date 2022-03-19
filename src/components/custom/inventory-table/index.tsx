import { ColumnsType } from 'antd/lib/table/interface'
import Link from 'next/link'
import { getDateState } from '@/src/utils/data/positions'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { calculateHealthFactor, parseDate, remainingTime } from '@/src/utils/table'
import { Table } from '@/src/components/antd'
import { CellValue } from '@/src/components/custom/cell-value'
import SkeletonTable, { SkeletonTableColumnsType } from '@/src/components/custom/skeleton-table'
import { Asset } from '@/src/components/custom/asset'
import { PositionsAtRiskTableWrapper } from '@/src/components/custom/positions-at-risk-table-wrapper'
import { Position } from '@/src/utils/data/positions'
import { tablePagination } from '@/src/utils/table'
import { WAD_DECIMALS } from '@/src/constants/misc'
import { getHumanValue } from '@/src/web3/utils'
import { getTokenByAddress } from '@/src/constants/bondTokens'

const Columns: ColumnsType<Position> = [
  {
    align: 'left',
    dataIndex: 'protocol',
    render: (protocol: Position['protocol'], position: Position) => (
      <Asset mainAsset={protocol} secondaryAsset={position.underlier.symbol} title={protocol} />
    ),
    title: 'Protocol',
    width: 200,
  },
  {
    align: 'left',
    dataIndex: 'collateral',
    render: (collateral: Position['collateral']) => (
      <CellValue bold value={getTokenByAddress(collateral.address)?.symbol ?? '-'} />
    ),
    title: 'Asset',
    width: 200,
  },
  {
    align: 'left',
    dataIndex: 'underlier',
    render: (underlier: Position['underlier']) => <CellValue bold value={underlier.symbol} />,
    responsive: ['lg'],
    title: 'Underlying',
  },
  {
    align: 'left',
    dataIndex: 'maturity',
    render: (maturity: Position['maturity']) => (
      <CellValue
        bottomValue={remainingTime(maturity)}
        state={getDateState(maturity)}
        value={parseDate(maturity)}
      />
    ),
    responsive: ['xl'],
    title: 'Maturity',
  },
  {
    align: 'left',
    dataIndex: 'totalNormalDebt',
    render: (minted: Position['totalNormalDebt']) => (
      <CellValue
        tooltip={`${minted}`}
        value={`${getHumanValue(minted, WAD_DECIMALS).toFixed(3)}`}
      />
    ),
    responsive: ['xl'],
    title: 'FIAT Minted',
  },
  {
    align: 'left',
    dataIndex: 'totalCollateral',
    render: (totalCollateral: Position['totalCollateral'], obj: Position) => (
      <CellValue
        bottomValue={`$${getHumanValue(obj.collateralValue, WAD_DECIMALS).toFixed(2)}`}
        // TODO: collateralValue = fairPrice * totalCollateral
        // (we need to scale by 36 because we are multiplicating 2 BigNumbers with 18 decimals)
        value={`${getHumanValue(totalCollateral, WAD_DECIMALS).toFixed(2)}`}
      />
    ),
    responsive: ['lg', 'xl'],
    title: 'Collateral Deposited',
  },
  // @TODO: missing info icon button
  {
    align: 'left',
    dataIndex: 'healthFactor',
    render: (healthFactor: Position['healthFactor']) => (
      <CellValue
        state={calculateHealthFactor(getHumanValue(healthFactor, WAD_DECIMALS))}
        value={`${getHumanValue(healthFactor, WAD_DECIMALS).toFixed(2)}`}
      />
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
  const riskPositions = inventory?.filter((p) => p.isAtRisk)

  return (
    <>
      {riskPositions && riskPositions.length > 0 && (
        <PositionsAtRiskTableWrapper>
          <Table columns={Columns} dataSource={riskPositions} loading={false} rowKey="address" />
        </PositionsAtRiskTableWrapper>
      )}
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
