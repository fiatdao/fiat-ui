import useSWR from 'swr'
import { useEffect, useState } from 'react'
import { BigNumber } from 'ethers'
import { USER_PROXY } from '@/src/queries/userProxy'
import { swrFetcher } from '@/src/utils/graphqlFetcher'
import { userProxy, userProxyVariables } from '@/types/subgraph/__generated__/userProxy'
import {
  positions_positions as SubgraphPosition,
  positions,
} from '@/types/subgraph/__generated__/positions'

import { POSITIONS } from '@/src/queries/positions'
import { bigNumberToDecimal } from '@/src/utils/formats'

export type Position = {
  key: string
  name: string
  discount: number
  ltv: number
  minted: number
  maturity: Date
  healthFactor: number
  action: {
    text: string
    data: Record<string, unknown>
  }
}

export type PositionTransaction = {
  asset: string
  action: string
  amount: number
  deltaAmount: number // does not exist in the scheme
  transactionHash: string
  date: Date
}

export type YourPositionPageInformation = {
  totalDebt: number
  currentValue: number
  lowestHealthFactor: number
  nextMaturity: number | null
}

/**
 * Returns a collection of Position required by the frontend
 * @param {SubgraphPosition} position
 * @returns [Position, Array<PositionTransaction>]
 */
export const transformPosition = (
  position: SubgraphPosition,
): [Position, PositionTransaction[]] => {
  const positionId = position.id
  const fiat = bigNumberToDecimal(position.totalNormalDebt)
  const collateral = bigNumberToDecimal(position.totalCollateral)
  const maturity = position.collateral?.maturity
    ? BigNumber.from(position.collateral.maturity)
    : undefined
  const name = position.vaultName

  const ltv = fiat / collateral
  const newMaturity = maturity?.mul(1000).toNumber() || Date.now()

  // @TODO: do calculation for hardcoded values
  const healthFactor = 1

  const newPosition: Position = {
    key: positionId,
    name: name ?? 'unknown',
    discount: collateral,
    minted: fiat,
    maturity: new Date(newMaturity),
    action: { text: 'Manage', data: { positionId } },
    ltv,
    healthFactor,
  }

  const newPositionTransactions = []

  for (const positionTransaction of position.positionTransactions || []) {
    const collateral = bigNumberToDecimal(positionTransaction.collateral)
    const deltaCollateral = bigNumberToDecimal(positionTransaction.deltaCollateral)
    const newPositionTransaction: PositionTransaction = {
      asset: name ?? 'unknown',
      action: positionTransaction.type,
      amount: collateral,
      deltaAmount: deltaCollateral,
      transactionHash: positionTransaction.id,
      date: new Date(newMaturity),
    }

    newPositionTransactions.push(newPositionTransaction)
  }

  return [newPosition, newPositionTransactions]
}

export const wrangePositions = ({ positions: rawPositions }: positions) => {
  const pTxs = []
  const p = []

  for (const position of rawPositions) {
    const [newPosition, newPositionTransactions] = transformPosition(position)
    p.push(newPosition)
    pTxs.push(...newPositionTransactions)
  }

  return { positions: p, positionTransactions: pTxs }
}

export const useUserProxy = (address: string) => {
  const { data } = useSWR([USER_PROXY, address], (url, value) =>
    swrFetcher<userProxy, userProxyVariables>(url, { id: value }),
  )

  return data?.userProxy?.proxyAddress || ''
}

/**
 * Fetches position information from the FIAT subgraph
 *
 * @todo: support notional-fi protocol
 * @todo: support barnBridge protocol
 *
 * @param {string | null} userAddress
 * @returns {Promise<[Position, Array<PositionTransaction>]>}
 */
export const usePositions = (userAddress: string | null) => {
  const userProxy = useUserProxy(userAddress ?? '')
  const [positions, setPositions] = useState<Position[]>([])
  const [positionTransactions, setPositionTransaction] = useState<PositionTransaction[]>([])

  // FixMe: allow filtering by userAddress (!!!!!!!)
  const { data } = useSWR([POSITIONS, userProxy || ''], (url) => swrFetcher<positions>(url))

  useEffect(() => {
    if (!data) {
      return
    }

    const { positionTransactions, positions } = wrangePositions(data)
    setPositions(positions)
    setPositionTransaction(positionTransactions)
  }, [data])

  return { positions, positionTransactions }
}
