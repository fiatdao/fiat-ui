import Popover from 'src/components/antd/popover'
import cn from 'classnames'
import { useCallback, useMemo, useState } from 'react'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import ToggleSwitch from '@/src/components/custom/toggle-switch'
import Filter from '@/src/resources/svg/filter.svg'
import s from '@/pages/create-position/s.module.scss'
import ButtonOutline from '@/src/components/antd/button-outline'
import { getProtocolsWithIcon } from '@/src/constants/bondTokens'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { PROTOCOLS, Protocol, protocolNamesByKeyword } from '@/types/protocols'

type FilterData = Record<Protocol, { active: boolean; name: string; icon: string }>

export const useProtocolFilters = () => {
  const { appChainId, isWalletConnected } = useWeb3Connection()
  const [inMyWallet, setInMyWallet] = useState(false)

  const FILTERS = useMemo(() => {
    return Object.fromEntries(
      Object.entries(getProtocolsWithIcon(appChainId)).map(([name, icon]) => {
        const protocolName = protocolNamesByKeyword[name.replace('vault', '')]
        return [protocolName, { active: true, name, icon }]
      }),
    ) as FilterData
  }, [appChainId])

  const [filters, setFilters] = useState<FilterData>(FILTERS)

  const activeProtocols = useMemo(
    () => PROTOCOLS.filter((protocol) => FILTERS[protocol]),
    [FILTERS],
  )

  const activeFilters = useMemo(
    () =>
      Object.values(filters)
        .filter(({ active }) => active)
        .map(({ name }) => name),
    [filters],
  )

  const areAllFiltersActive = Object.keys(filters).every((s) => filters[s as Protocol].active)

  const setFilter = useCallback((filterName: Protocol, active: boolean) => {
    setFilters((filters) => {
      const filter = filters[filterName]
      return { ...filters, [filterName]: { ...filter, active: active } }
    })
  }, [])

  const activateAllFilters = useCallback(() => {
    activeProtocols.map((asset) => {
      setFilter(asset, true)
    })
  }, [activeProtocols, setFilter])

  const clearAllFilters = useCallback(() => {
    activeProtocols.map((asset) => {
      setFilter(asset, false)
    })
  }, [activeProtocols, setFilter])

  const toggleInMyWallet = () => setInMyWallet((prev) => !prev)

  const renderFilters = () => (
    <>
      <ButtonOutline
        height="lg"
        isActive={areAllFiltersActive}
        onClick={activateAllFilters}
        rounded
      >
        All assets
      </ButtonOutline>
      {activeProtocols.map((asset) => {
        return (
          <ButtonOutline
            height="lg"
            isActive={filters[asset].active}
            key={asset}
            onClick={() => {
              clearAllFilters()
              setFilter(asset, true)
            }}
            rounded
          >
            <img alt={asset} src={filters[asset].icon} width={30} />
            {asset}
          </ButtonOutline>
        )
      })}
    </>
  )

  const displayFilters = (withWalletFilter = true) => (
    <>
      <div className={cn(s.filters)}>
        {renderFilters()}
        {withWalletFilter && (
          <ToggleSwitch
            checked={inMyWallet}
            className={cn(s.switch)}
            disabled={!isWalletConnected}
            label="In my wallet"
            onChange={toggleInMyWallet}
          />
        )}
      </div>
      <Popover
        arrowContent={false}
        content={
          <>
            <div className={cn(s.filtersGrid)}>{renderFilters()}</div>
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
    </>
  )

  return {
    areAllFiltersActive,
    setFilter,
    activateAllFilters,
    activeFilters,
    FILTERS,
    filters,
    activeProtocols,
    inMyWallet,
    isWalletConnected,
    toggleInMyWallet,
    displayFilters,
  }
}
