import { useElementTranchesJSON } from './useElementTranchesJSON'
import { Button } from 'antd'
import Link from 'next/link'
import { useMemo } from 'react'
import { Text } from '@/src/components/custom/typography'
import { TrancheData } from '@/types'

export const usePositionsData = () => {
  const elementData = useElementTranchesJSON()

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

  console.log({ dataFiltered })

  const data = [
    {
      protocol: 'BarnBridge',
      collateral: 'bb_sBOND...',
      maturity: '0',
      faceValue: '0',
      currentValue: '0',
      action: (
        <Link href="/open-position/0xdcf80c068b7ffdf7273d8adae4b076bf384f711a/open" passHref>
          <Button>Open</Button>
        </Link>
      ),
    },
    {
      protocol: 'Element',
      collateral: 'ePyvUSDC...',
      maturity: '0',
      faceValue: '0',
      currentValue: '0',
      action: (
        <Link href="/open-position/0xdcf80c068b7ffdf7273d8adae4b076bf384f711a/manage" passHref>
          <Button>Manage</Button>
        </Link>
      ),
    },
    {
      protocol: 'Notional',
      collateral: 'ffDAI...',
      maturity: '0',
      faceValue: '0',
      currentValue: '0',
      action: <Text type="p3">No assets</Text>,
    },
  ]

  return data
}
