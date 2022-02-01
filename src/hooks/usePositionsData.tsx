import { useElementTranchesJSON } from './useElementTranchesJSON'
import { useWeb3Connection } from '../providers/web3ConnectionProvider'
import Link from 'next/link'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Contract } from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers'
import { TrancheData } from '@/types'
import tranche from '@/src/abis/Tranche.json'
import { Tranche } from '@/types/typechain'
import ButtonGradient from '@/src/components/antd/button-gradient'

type PositionData = TrancheData & {
  action: ReactNode
  collateral: string
  currentValue: string
  faceValue: string
  maturity: Date
  name: string
  protocol: string // FIXME use Protocol type
}
export const usePositionsData = () => {
  const [positionsData, setPositionsData] = useState<PositionData[]>([])
  const elementData = useElementTranchesJSON()
  const { readOnlyAppProvider, web3Provider } = useWeb3Connection()
  const provider = useMemo(
    () => web3Provider || readOnlyAppProvider,
    [readOnlyAppProvider, web3Provider],
  )

  const dataFiltered = useMemo(() => {
    if (!elementData) return {}
    const tranches: Record<string, TrancheData[]> = {}
    Object.entries(elementData.tranches).forEach(([collateral, trancheData]) => {
      const now = Date.now() / 1000
      const filtered = trancheData.filter((pos) => {
        return pos.expiration > now
      })

      if (Object.keys(filtered).length > 0)
        tranches[collateral] = { ...tranches[collateral], ...filtered }
    })

    return tranches
  }, [elementData])

  const fetchPositions = useCallback(
    async (provider: JsonRpcProvider) => {
      const result: PositionData[] = []

      const network = await provider.getNetwork()
      console.log(`Fetching positions for ${network.name}`)
      for (const symbol in dataFiltered) {
        const positions = dataFiltered[symbol]
        for (const index in positions) {
          const position = positions[index]
          const contract = new Contract(position.address, tranche, provider) as Tranche

          let name = 'N/A'
          let collateral = 'N/A'
          try {
            name = await contract.name()
            collateral = await contract.symbol()
          } catch (e) {
            //console.log(e)
          }

          result.push({
            ...position,
            name,
            collateral,
            protocol: 'Element',
            maturity: new Date(position.expiration * 1000),
            faceValue: '0',
            currentValue: '0',
            action: (
              <Link href={`/open-position/${position.address}/open`} passHref>
                <ButtonGradient>Open Position</ButtonGradient>
              </Link>
            ),
          })
        }
      }

      return result
    },
    [dataFiltered],
  )

  useEffect(() => {
    let stale = false
    fetchPositions(provider).then((data) => {
      if (!stale) setPositionsData(data)
    })

    return () => {
      stale = true
    }
  }, [fetchPositions, provider])

  console.log('Fetched', { positionsData })
  return positionsData
}
