import Popover from 'src/components/antd/popover'
import cn from 'classnames'
import { useMemo, useState } from 'react'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import ToggleSwitch from '@/src/components/custom/toggle-switch'
import Filter from '@/src/resources/svg/filter.svg'
import s from '@/pages/create-position/s.module.scss'
import ButtonOutline from '@/src/components/antd/button-outline'
import { getInitialProtocolFilters, ProtocolFilter } from '@/src/constants/bondTokens'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

interface FilterState {
  inMyWallet: boolean
  protocolFilters: Array<ProtocolFilter>
}

export const useProtocolFilters = () => {
  const { appChainId, isWalletConnected } = useWeb3Connection()

  const initialProtocolFilters = useMemo(() => {
    return getInitialProtocolFilters(appChainId)
  }, [appChainId])

  const initialFilters = useMemo(() => {
    return {
      inMyWallet: false,
      protocolFilters: initialProtocolFilters,
    } as FilterState
  }, [initialProtocolFilters])

  const [filterState, setFilterState] = useState(initialFilters)
  // const [filters, setFilters] = useState(FILTERS)

  // const activeProtocols = useMemo(
  //   () => PROTOCOLS.filter((protocol) => FILTERS[protocol]),
  //   [FILTERS],
  // )

  // const activeFilters = useMemo(
  //   () =>
  //     Object.values(filters)
  //       .filter(({ active }) => active)
  //       .map(({ name }) => name),
  //   [filters],
  // )

  const areAllFiltersActive = filterState.protocolFilters.every(
    (protocolFilter) => protocolFilter.isActive,
  )

  const activateAllFilters = () => {
    const newProtocolFilters = filterState.protocolFilters.map((protocolFilter) =>
      Object.assign({ ...protocolFilter, isActive: true }),
    )
    setFilterState({ ...filterState, protocolFilters: newProtocolFilters })
  }

  // TODO: this works. add back clear button. 
  // const clearAllFilters = () => {
  //   const newProtocolFilters = filterState.protocolFilters.map((protocolFilter) =>
  //     Object.assign({ ...protocolFilter, isActive: false }),
  //   )
  //   setFilterState({ ...filterState, protocolFilters: newProtocolFilters })
  // }

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

  const toggleInMyWallet = () => {
    setFilterState({
      ...filterState,
      inMyWallet: !filterState.inMyWallet,
    })
  }

  const renderFilterButtons = () => (
    <>
      <ButtonOutline
        height="lg"
        isActive={areAllFiltersActive}
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

  const displayFilters = (withWalletFilter = true) => (
    <>
      <div className={cn(s.filters)}>
        {renderFilterButtons()}
        {withWalletFilter && (
          <ToggleSwitch
            checked={filterState.inMyWallet}
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
    // activeFilters,
    // inMyWallet,
    displayFilters,
  }
}
