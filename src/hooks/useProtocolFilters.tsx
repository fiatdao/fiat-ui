import s from '@/pages/create-position/s.module.scss'
import ButtonOutline from '@/src/components/antd/button-outline'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import ToggleSwitch from '@/src/components/custom/toggle-switch'
import { ProtocolFilter, getInitialProtocolFilters } from '@/src/constants/bondTokens'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import Filter from '@/src/resources/svg/filter.svg'
import Popover from 'src/components/antd/popover'
import cn from 'classnames'
import { useMemo, useState } from 'react'

export interface CollateralFilter {
  filterByInMyWallet: boolean
  filterOutMatured: boolean
  protocolFilters: Array<ProtocolFilter>
}

export const useProtocolFilters = () => {
  const { appChainId, isWalletConnected } = useWeb3Connection()

  const initialFilters = useMemo(() => {
    return {
      filterByInMyWallet: false,
      filterOutMatured: true,
      protocolFilters: getInitialProtocolFilters(appChainId),
    } as CollateralFilter
  }, [appChainId])

  const [filterState, setFilterState] = useState(initialFilters)

  const protocolsToFilterBy = useMemo(() => {
    // Reduce `filterState.protocolFilters` to the list of protocol names whose filters are active
    return filterState.protocolFilters.reduce<Array<string>>((protocolNames, protocolFilter) => {
      if (protocolFilter.isActive) {
        protocolNames.push(protocolFilter.protocolName)
      }
      return protocolNames
    }, [])
  }, [filterState.protocolFilters])

  const areAllProtocolFiltersActive = useMemo(() => {
    return filterState.protocolFilters.every((protocolFilter) => protocolFilter.isActive)
  }, [filterState.protocolFilters])

  const activateAllFilters = () => {
    const newProtocolFilters = filterState.protocolFilters.map((protocolFilter) =>
      Object.assign({ ...protocolFilter, isActive: true }),
    )
    setFilterState({ ...filterState, protocolFilters: newProtocolFilters })
  }

  const activateFilterForProtocolName = (protocolName: string) => {
    const newProtocolFilters = filterState.protocolFilters.map((protocolFilter) => {
      if (protocolFilter.protocolName === protocolName) {
        protocolFilter.isActive = true
      } else {
        protocolFilter.isActive = false
      }
      return protocolFilter
    })

    setFilterState({
      ...filterState,
      protocolFilters: newProtocolFilters,
    })
  }

  const toggleFilterOutMatured = () => {
    setFilterState({
      ...filterState,
      filterOutMatured: !filterState.filterOutMatured,
    })
  }

  const toggleInMyWallet = () => {
    setFilterState({
      ...filterState,
      filterByInMyWallet: !filterState.filterByInMyWallet,
    })
  }

  const renderFilterButtons = () => (
    <>
      <ButtonOutline
        height="lg"
        isActive={areAllProtocolFiltersActive}
        onClick={activateAllFilters}
        rounded
      >
        All assets
      </ButtonOutline>
      {filterState.protocolFilters.map((protocolFilter) => {
        return (
          <ButtonOutline
            height="lg"
            isActive={protocolFilter.isActive}
            key={protocolFilter.protocolName}
            onClick={() => {
              activateFilterForProtocolName(protocolFilter.protocolName)
            }}
            rounded
          >
            <img alt={protocolFilter.protocolName} src={protocolFilter.iconLink} width={30} />
            {protocolFilter.protocolName}
          </ButtonOutline>
        )
      })}
    </>
  )

  const renderFilters = (withWalletFilter = true, withMaturedFilter = true) => (
    <>
      <div className={cn(s.filters)}>
        {renderFilterButtons()}
        {withWalletFilter && (
          <ToggleSwitch
            checked={filterState.filterByInMyWallet}
            className={cn(s.switch)}
            disabled={!isWalletConnected}
            label="In my wallet"
            onChange={toggleInMyWallet}
          />
        )}
        {withMaturedFilter && (
          <ToggleSwitch
            checked={filterState.filterOutMatured}
            className={cn(s.switch)}
            disabled={!isWalletConnected}
            label="Filter out matured?"
            onChange={toggleFilterOutMatured}
          />
        )}
      </div>

      <Popover
        arrowContent={false}
        content={
          <>
            <div className={cn(s.filtersGrid)}>{renderFilterButtons()}</div>
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
    protocolsToFilterBy,
    filterByInMyWallet: filterState.filterByInMyWallet,
    filterOutMatured: filterState.filterOutMatured,
    renderFilters,
  }
}
