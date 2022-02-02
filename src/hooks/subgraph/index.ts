import useSWR from 'swr'
import { JsonRpcProvider } from '@ethersproject/providers'
import { useEffect, useState } from 'react'
import { USER_PROXY } from '@/src/queries/userProxy'
import { swrFetcher } from '@/src/utils/graphqlFetcher'
import { userProxy, userProxyVariables } from '@/types/subgraph/__generated__/userProxy'
import {
  positions_positions as SubgraphPosition,
  positions,
  positionsVariables,
} from '@/types/subgraph/__generated__/positions'

import { POSITIONS } from '@/src/queries/positions'
import { bigNumberToDecimal } from '@/src/utils/formats'
import vaultEPTCall from '@/src/utils/callVaultEPT'
import trancheCall from '@/src/utils/callTranche'
import { Web3Context } from '@/src/providers/web3ConnectionProvider'

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
 * @param {Web3Context['readOnlyAppProvider']} provider
 * @returns Promise<[Position, Array<PositionTransaction>]>
 */
export const transformPosition = async (
  position: SubgraphPosition,
  provider: Web3Context['readOnlyAppProvider'],
): Promise<[Position, PositionTransaction[]]> => {
  const positionId = position.id
  const vaultAddress = position.vault.address
  const tokenId = position.tokenId
  const fiat = bigNumberToDecimal(position.normalDebt)
  const collateral = bigNumberToDecimal(position.collateral)

  const [maturity, trancheAddress] = await Promise.all([
    vaultEPTCall(vaultAddress, provider, 'maturity', [tokenId]),
    vaultEPTCall(vaultAddress, provider, 'getTokenAddress', [tokenId]),
  ])

  const name = await trancheCall(trancheAddress!, provider, 'name', null)

  // const name = vault.underlyingAsset;
  // const underlierToken = await vaultEPTCall(vaultAddress, provider, "underlierToken", null);
  // const discount = await vaultEPTCall(vaultAddress, provider, 'fairPrice', [tokenId, true, true]);
  // const decimals = await trancheCall(trancheAddress!, provider, 'decimals', null);

  const ltv = fiat / collateral
  const newMaturity = maturity?.mul(1000).toNumber() || Date.now()

  // @TODO: implement calculation for hardcoded values
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
    // const deltaCollateral = bigNumberToDecimal(positionTransaction.deltaCollateral)
    const newPositionTransaction: PositionTransaction = {
      asset: name ?? 'unknown',
      action: positionTransaction.type,
      amount: collateral,
      deltaAmount: 0, // FixMe: it must be `deltaCollateral`
      transactionHash: positionTransaction.id,
      date: new Date(newMaturity),
    }

    newPositionTransactions.push(newPositionTransaction)
  }

  return [newPosition, newPositionTransactions]
}

export const useUserProxy = (address: string) => {
  const { data } = useSWR([USER_PROXY, address], (url, value) =>
    swrFetcher<userProxy, userProxyVariables>(url, { id: value! }),
  )

  return data?.userProxy?.proxyAddress || ''
}

const wrangePositions = async (
  { positions: rawPositions }: positions,
  provider: JsonRpcProvider,
) => {
  const pTxs = []
  const p = []

  for (const position of rawPositions) {
    const [newPosition, newPositionTransactions] = await transformPosition(position, provider)
    p.push(newPosition)
    pTxs.push(...newPositionTransactions)
  }

  return { positions: p, positionTransactions: pTxs }
}

// @TODO: currently working for element-fi

/**
 * Fetches position information from the FIAT subgraph
 *
 * @todo: support notional-fi protocol
 * @todo: support barnBridge protocol
 *
 * @param {string} userAddress
 * @param {Web3Context['readOnlyAppProvider']} provider
 * @returns {Promise<[Position, Array<PositionTransaction>]>}
 */
export const usePositions = (userAddress: string, provider: JsonRpcProvider) => {
  const userProxy = useUserProxy(userAddress || '')
  const [positions, setPositions] = useState<Position[]>([])
  const [positionTransactions, setPositionTransaction] = useState<PositionTransaction[]>([])

  const { data } = useSWR([POSITIONS, userProxy || ''], (url, value) =>
    swrFetcher<positions, positionsVariables>(url, { user: value! }),
  )

  useEffect(() => {
    data &&
      wrangePositions(data, provider).then(({ positionTransactions, positions }) => {
        setPositions(positions)
        setPositionTransaction(positionTransactions)
      })
  }, [data, provider])

  return { positions, positionTransactions }
}
