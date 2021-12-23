import { useElementTranchesJSON } from './useElementTranchesJSON'
import { useWeb3Connection } from '../providers/web3ConnectionProvider'
import { Button } from 'antd'
import Link from 'next/link'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import { Contract } from 'ethers'
import { JsonRpcProvider } from '@ethersproject/providers'
import { TrancheData } from '@/types'
import tranche from '@/src/abis/Tranche.json'
import { Tranche } from '@/types/typechain'

type PositionData = TrancheData & {
  name: string
  collateral: string
  protocol: string // FIXME use Protocol type
  maturity: Date
  faceValue: string
  currentValue: string
  action: ReactNode
}
export const usePositionsData = () => {
  const [positionsData, setPositionsData] = useState<PositionData[]>([])
  const elementData = useElementTranchesJSON()
  const { isAppConnected, readOnlyAppProvider, web3Provider } = useWeb3Connection()
  const provider = useMemo(
    () => (isAppConnected && web3Provider ? web3Provider : readOnlyAppProvider),
    [isAppConnected, readOnlyAppProvider, web3Provider],
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
      console.log({ network })
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
                <Button>Open</Button>
              </Link>
              //     <Link href="/open-position/0xdcf80c068b7ffdf7273d8adae4b076bf384f711a/manage" passHref>
              //     <Button>Manage</Button>
              //   </Link>
              // action: <Text type="p3">No assets</Text>,
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

  console.log({ positionsData })
  return positionsData
}
