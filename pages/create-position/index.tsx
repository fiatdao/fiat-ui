import s from './s.module.scss'
import { ColumnsType } from 'antd/lib/table/interface'
import cn from 'classnames'
import Link from 'next/link'
import { useCollaterals } from '@/src/hooks/subgraph/useCollaterals'
import { Table } from '@/src/components/antd'
import ButtonGradient from '@/src/components/antd/button-gradient'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import { Asset } from '@/src/components/custom/asset'
import { CellValue } from '@/src/components/custom/cell-value'
import SafeSuspense from '@/src/components/custom/safe-suspense'
import SkeletonTable, { SkeletonTableColumnsType } from '@/src/components/custom/skeleton-table'
import { WAD_DECIMALS } from '@/src/constants/misc'
import { useProtocolFilters } from '@/src/hooks/useProtocolFilters'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Collateral } from '@/src/utils/data/collaterals'
import { parseDate, remainingTime, tablePagination } from '@/src/utils/table'
import { getHumanValue } from '@/src/web3/utils'

const PositionsTable = ({ columns, filters, inMyWallet }: any) => {
  const collaterals = useCollaterals(inMyWallet, filters)

  return (
    <Table
      columns={columns}
      dataSource={collaterals}
      pagination={tablePagination(collaterals?.length ?? 0)}
      rowKey="id"
      scroll={{
        x: true,
      }}
    />
  )
}

const CreatePosition = () => {
  const { isWalletConnected } = useWeb3Connection()
  const { activeFilters, displayFilters, inMyWallet } = useProtocolFilters()

  const columns: ColumnsType<Collateral> = [
    {
      align: 'left',
      dataIndex: 'protocol',
      render: (protocol: Collateral['protocol'], { url, vault: { name } }) => {
        return <Asset mainAsset={name} title={protocol} url={url} />
      },
      title: 'Protocol',
      width: 200,
    },
    {
      align: 'left',
      dataIndex: 'asset',
      render: (asset: Collateral['asset']) => <CellValue value={asset} />,
      title: 'Asset',
    },
    {
      align: 'left',
      dataIndex: 'faceValue',
      render: (value: Collateral['faceValue']) => (
        <CellValue
          tooltip={`$${getHumanValue(value ?? 0, WAD_DECIMALS)}`}
          value={`$${getHumanValue(value ?? 0, WAD_DECIMALS)?.toFixed(2)}`}
        />
      ),
      title: 'Face Value',
    },
    {
      align: 'left',
      dataIndex: 'currentValue',
      render: (value: Collateral['currentValue']) => (
        <CellValue
          tooltip={`$${getHumanValue(value ?? 0, WAD_DECIMALS)}`}
          value={`${value ? '$' + getHumanValue(value ?? 0, WAD_DECIMALS)?.toFixed(2) : '-'}`}
        />
      ),
      title: 'Collateral Value',
    },
    {
      align: 'left',
      dataIndex: 'maturity',
      render: (date: Collateral['maturity']) => (
        <CellValue bottomValue={parseDate(date)} value={`${remainingTime(date)} Left`} />
      ),
      title: 'Maturity',
    },
    {
      align: 'right',
      render: (collateral: Collateral) => {
        return collateral.manageId ? (
          <Link href={`/your-positions`} passHref>
            <ButtonOutlineGradient disabled={!isWalletConnected}>Manage</ButtonOutlineGradient>
          </Link>
        ) : (
          <Link href={`/create-position/${collateral.address}/open`} passHref>
            <ButtonGradient disabled={!isWalletConnected}>Create Position</ButtonGradient>
          </Link>
        )
      },
      title: '',
      width: 110,
    },
  ]

  return (
    <>
      <h2 className={cn(s.title)}>Select a collateral type to add to your FIAT positions</h2>
      {displayFilters()}

      <SafeSuspense
        fallback={
          <SkeletonTable columns={columns as SkeletonTableColumnsType[]} loading rowCount={2} />
        }
      >
        <PositionsTable columns={columns} filters={activeFilters} inMyWallet={inMyWallet} />
      </SafeSuspense>
    </>
  )
}

export default CreatePosition
