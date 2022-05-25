import s from './s.module.scss'
import cn from 'classnames'
import { ColumnsType } from 'antd/lib/table/interface'
import Link from 'next/link'
import BigNumber from 'bignumber.js'
import { useProtocolFilters } from '@/src/hooks/useProtocolFilters'
import { FIAT_TICKER } from '@/src/constants/misc'
import SafeSuspense from '@/src/components/custom/safe-suspense'
import { useAuctions } from '@/src/hooks/subgraph/useAuctions'
import ButtonGradient from '@/src/components/antd/button-gradient'
import SkeletonTable, { SkeletonTableColumnsType } from '@/src/components/custom/skeleton-table'
import { Table } from '@/src/components/antd'
import { parseDate, parseTime, tablePagination } from '@/src/utils/table'
import { CellValue } from '@/src/components/custom/cell-value'
import { Asset } from '@/src/components/custom/asset'
import { AuctionData } from '@/src/utils/data/auctions'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import withRequiredValidChain from '@/src/hooks/RequiredValidChain'

const AuctionsTable = ({ columns, protocolsToFilterBy }: any) => {
  const { auctions } = useAuctions(protocolsToFilterBy)

  return (
    <Table
      columns={columns}
      dataSource={auctions}
      loading={false}
      pagination={tablePagination(auctions?.length ?? 0)}
      rowKey="id"
      scroll={{
        x: true,
      }}
    />
  )
}

const UNKNOWN = 'Unknown'

const Auctions = () => {
  const { isWalletConnected } = useWeb3Connection()
  const { protocolsToFilterBy, renderFilters } = useProtocolFilters()

  const columns: ColumnsType<any> = [
    {
      align: 'left',
      dataIndex: 'protocol',
      render: (protocol: AuctionData['protocol']) => (
        <Asset mainAsset={protocol.name ?? ''} title={protocol.humanReadableName ?? ''} />
      ),
      title: 'Protocol',
      width: 200,
    },
    {
      align: 'left',
      dataIndex: 'asset',
      render: (value: string, { url }) => <CellValue url={url} value={value} />,
      title: 'Asset',
    },
    {
      align: 'left',
      dataIndex: 'endsAt',
      render: (value: Date) => (
        <CellValue bottomValue={parseTime(value)} value={parseDate(value)} />
      ),
      title: 'Restarts At',
    },
    {
      align: 'left',
      dataIndex: 'auctionedCollateral',
      render: (value?: BigNumber) => <CellValue value={value?.toFixed(2) ?? UNKNOWN} />,
      title: 'Auctioned Collateral',
    },
    {
      align: 'left',
      dataIndex: 'currentAuctionPrice',
      render: (value?: BigNumber) => (
        <CellValue value={`${value?.toFixed(4) ?? UNKNOWN} ${FIAT_TICKER}`} />
      ),
      title: 'Current Auction Price',
    },
    {
      align: 'left',
      dataIndex: 'faceValue',
      render: (value?: BigNumber) => <CellValue value={`$${value?.toFixed(4) ?? UNKNOWN}`} />,
      title: 'Face Value',
    },
    {
      align: 'left',
      dataIndex: 'apy',
      render: (value: string) => <CellValue value={`${value}%`} />,
      title: 'APY',
    },
    {
      align: 'right',
      dataIndex: 'action',
      render: ({ id, isActive }) =>
        isActive ? (
          <Link href={`/auctions/${id}/buy`} passHref>
            <ButtonGradient disabled={!isWalletConnected}>Buy collateral</ButtonGradient>
          </Link>
        ) : (
          <ButtonGradient disabled>Not Available</ButtonGradient>
        ),
      title: '',
      width: 110,
    },
  ]

  return (
    <>
      <h2 className={cn(s.title)}>Select a collateral asset on auction to buy</h2>
      {renderFilters(false)}
      <SafeSuspense
        fallback={
          <SkeletonTable columns={columns as SkeletonTableColumnsType[]} loading rowCount={2} />
        }
      >
        <AuctionsTable columns={columns} protocolsToFilterBy={protocolsToFilterBy} />
      </SafeSuspense>
    </>
  )
}

export default withRequiredValidChain(Auctions)
