import s from './s.module.scss'
import SafeSuspense from '@/src/components/custom/safe-suspense'
import SkeletonTable, { SkeletonTableColumnsType } from '@/src/components/custom/skeleton-table'
import Popover from '@/src/components/antd/popover'
import { parseDate, remainingTime } from '@/src/utils/table'
import Element from '@/src/resources/svg/element.svg'
import { Table } from '@/src/components/antd'
import ToggleSwitch from '@/src/components/custom/toggle-switch'
import { CellValue } from '@/src/components/custom/cell-value'
import { Asset } from '@/src/components/custom/asset'
import ButtonOutline from '@/src/components/antd/button-outline'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import Filter from '@/src/resources/svg/filter.svg'
import { ELEMENT_SUBGRAPH_PROTOCOL, PROTOCOLS, Protocol } from '@/types/protocols'
import { useCollaterals } from '@/src/hooks/subgraph/useCollaterals'
import { Collateral, formatColRatio } from '@/src/utils/data/collaterals'
import { getHumanValue } from '@/src/web3/utils'
import { WAD_DECIMALS } from '@/src/constants/misc'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { tablePagination } from '@/src/utils/table'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import Link from 'next/link'
import { ReactNode, useCallback, useState } from 'react'
import cn from 'classnames'
import { ColumnsType } from 'antd/lib/table/interface'

type FilterData = Record<Protocol, { active: boolean; name: string; icon: ReactNode }>

const FILTERS: FilterData = {
  // BarnBridge: { active: false, name: 'BarnBridge', icon: <BarnBridge /> },
  Element: { active: false, name: ELEMENT_SUBGRAPH_PROTOCOL, icon: <Element /> },
  // Notional: { active: false, name: 'Notional', icon: <Notional /> },
}

// TODO fix types here
const PositionsTable = ({ collaterals, columns }: any) => {
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
  const [filters, setFilters] = useState<FilterData>(FILTERS)
  const [inMyWallet, setInMyWallet] = useState(false)
  const { isWalletConnected } = useWeb3Connection()

  const activeFilters = Object.values(filters)
    .filter((f) => f.active)
    .map((f) => f.name)
  const collaterals = useCollaterals(inMyWallet, activeFilters)

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
      dataIndex: 'symbol',
      render: (symbol: Collateral['symbol']) => <CellValue value={symbol} />,
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
      dataIndex: 'vault',
      render: ({ collateralizationRatio: value }: Collateral['vault']) => {
        return <CellValue value={value ? `${formatColRatio(value)}%` : '-'} />
      },
      title: 'Collateralization Threshold',
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

  const areAllFiltersActive = Object.keys(filters).every((s) => filters[s as Protocol].active)

  const setFilter = useCallback((filterName: Protocol, active: boolean) => {
    setFilters((filters) => {
      const filter = filters[filterName]
      return { ...filters, [filterName]: { ...filter, active: active } }
    })
  }, [])

  const activateAllFilters = useCallback(() => {
    PROTOCOLS.map((asset) => {
      setFilter(asset, true)
    })
  }, [setFilter])

  const clearAllFilters = useCallback(() => {
    PROTOCOLS.map((asset) => {
      setFilter(asset, false)
    })
  }, [setFilter])

  const renderFilters = () => (
    <>
      <ButtonOutline
        height="lg"
        isActive={areAllFiltersActive}
        onClick={() => activateAllFilters()}
        rounded
      >
        All assets
      </ButtonOutline>
      {PROTOCOLS.map((asset) => {
        return (
          <ButtonOutline
            height="lg"
            isActive={filters[asset].active}
            key={asset}
            onClick={() => {
              clearAllFilters()
              setFilter(asset, !filters[asset].active)
            }}
            rounded
          >
            {filters[asset].icon}
            {asset}
          </ButtonOutline>
        )
      })}
    </>
  )

  const clearButton = () => (
    <button className={cn(s.clear)} onClick={clearAllFilters}>
      Clear
    </button>
  )

  return (
    <>
      <h2 className={cn(s.title)}>Select a collateral type to add to your FIAT positions</h2>
      <div className={cn(s.filters)}>
        {renderFilters()}
        {clearButton()}
        <ToggleSwitch
          checked={inMyWallet}
          className={cn(s.switch)}
          disabled={!isWalletConnected}
          label="In my wallet"
          onChange={() => {
            setInMyWallet(!inMyWallet)
          }}
        />
      </div>
      <Popover
        arrowContent={false}
        content={
          <>
            <div className={cn(s.fitersGrid)}>{renderFilters()}</div>
            <div className={cn(s.buttonContainer)}>{clearButton()}</div>
          </>
        }
        placement="bottomLeft"
        trigger="click"
      >
        <ButtonOutlineGradient className={cn(s.filtersButton)} height="lg">
          Filter
          <Filter />
        </ButtonOutlineGradient>
      </Popover>

      <SafeSuspense
        fallback={
          <SkeletonTable columns={columns as SkeletonTableColumnsType[]} loading rowCount={2} />
        }
      >
        <PositionsTable collaterals={collaterals} columns={columns} />
      </SafeSuspense>
    </>
  )
}

export default CreatePosition
