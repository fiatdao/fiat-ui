import useSWR from 'swr'
import { JsonRpcProvider } from '@ethersproject/providers'
import { useEffect, useState } from 'react'
import { USER_PROXY } from '@/src/queries/userProxy'
import { swrFetcher } from '@/src/utils/graphqlFetcher'
import { userProxy, userProxyVariables } from '@/types/subgraph/__generated__/userProxy'
import {
  positions,
  positionsVariables,
  positions_positions,
} from '@/types/subgraph/__generated__/positions'

import { POSITIONS } from '@/src/queries/positions'
import { bigNumberToDecimal } from '@/src/utils/formats'
import vaultEPTCall from '@/src/utils/callVaultEPT'
import trancheCall from '@/src/utils/callTranche'

export type Position = {
  name: string
  discount: number
  ltv: number
  minted: number
  maturity: Date
  healthFactor: number | null
  action: string
}

export type PositionTransaction = {
  asset: string
  action: string
  amount: number
  deltaAmount: number
  transactionHash: string
  date: Date
}

const transformPosition = async (
  position: positions_positions,
  provider: JsonRpcProvider,
): Promise<[Position, PositionTransaction[]]> => {
  const vaultAddress = position.vault.address
  const tokenId = position.tokenId
  // const name = vault.underlyingAsset;
  const collateral = bigNumberToDecimal(position.collateral)
  const fiat = bigNumberToDecimal(position.normalDebt)
  const maturity = await vaultEPTCall(vaultAddress, provider, 'maturity', [tokenId])
  const trancheAddress = await vaultEPTCall(vaultAddress, provider, 'getTokenAddress', [tokenId])
  // const underlierToken = await vaultEPTCall(vaultAddress, provider, "underlierToken", null);
  // const discount = await vaultEPTCall(vaultAddress, provider, 'fairPrice', [tokenId, true, true]);
  const name = await trancheCall(trancheAddress!, provider, 'name', null)
  // const decimals = await trancheCall(trancheAddress!, provider, 'decimals', null);
  // @TODO
  const ltv = fiat / collateral
  const healthFactor = 1
  const newMaturity = maturity?.mul(1000).toNumber() || Date.now()

  const newPosition: Position = {
    name: name!,
    discount: collateral,
    minted: fiat,
    maturity: new Date(newMaturity),
    action: 'manage',
    ltv: ltv,
    healthFactor,
  }
  const newPositionTransactions = []
  for (const positionTransaction of position.positionTransactions ?? []) {
    const collateral = bigNumberToDecimal(positionTransaction.collateral)
    // TODO const deltaCollateral = bigNumberToDecimal(positionTransaction.deltaCollateral)
    const newPositionTransaction: PositionTransaction = {
      asset: name!,
      action: positionTransaction.type,
      amount: collateral,
      deltaAmount: 0,
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
