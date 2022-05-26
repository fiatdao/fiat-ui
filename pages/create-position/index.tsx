import s from './s.module.scss'
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
import withRequiredValidChain from '@/src/hooks/RequiredValidChain'
import { usePositionsByUser } from '@/src/hooks/subgraph/usePositionsByUser'
import Link from 'next/link'
import cn from 'classnames'
import { ColumnsType } from 'antd/lib/table/interface'

const PositionsTable = ({ columns, filterByInMyWallet, protocolsToFilterBy }: any) => {
  const collaterals = useCollaterals(filterByInMyWallet, protocolsToFilterBy)

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
  const { filterByInMyWallet, protocolsToFilterBy, renderFilters } = useProtocolFilters()
  const { positions } = usePositionsByUser()

  const columns: ColumnsType<Collateral> = [
    {
      align: 'left',
      dataIndex: 'protocol',
      render: (protocol: Collateral['protocol'], { vault: { name } }) => {
        return <Asset mainAsset={name} title={protocol} />
      },
      title: 'Protocol',
      width: 200,
    },
    {
      align: 'left',
      dataIndex: 'asset',
      render: (asset: Collateral['asset'], { url }) => <CellValue url={url} value={asset} />,
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
        // use combo of collateral manageId & collateral tokenId matching a position tokenId to determine if position exists for collateral
        const hasPositionForCollateral =
          collateral.manageId &&
          positions.filter((position) => collateral.tokenId === position.tokenId).length > 0

        return hasPositionForCollateral ? (
          <Link href={`/your-positions`} passHref>
            <ButtonOutlineGradient disabled={!isWalletConnected}>Manage</ButtonOutlineGradient>
          </Link>
        ) : (
          <Link href={`/create-position/${collateral.id}/open`} passHref>
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
      <div>{renderFilters()}</div>

      <SafeSuspense
        fallback={
          <SkeletonTable columns={columns as SkeletonTableColumnsType[]} loading rowCount={2} />
        }
      >
        <PositionsTable
          columns={columns}
          filterByInMyWallet={filterByInMyWallet}
          protocolsToFilterBy={protocolsToFilterBy}
        />
      </SafeSuspense>
    </>
  )
}

export default withRequiredValidChain(CreatePosition)
