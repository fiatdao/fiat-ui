import trancheCall from './callTranche'
import vaultEPTCall from './callVaultEPT'
import { bigNumberToDecimal } from './formats'
import { SUBGRAPH_API } from '../constants/misc'
import { min } from 'date-fns'
import { Web3Context } from '@/src/providers/web3ConnectionProvider'

export type YourPositionPageInformation = {
  totalDebt: number
  currentValue: number
  lowestHealthFactor: number
  nextMaturity: number | null
}

export type SubgraphPosition = {
  id: string
  vault: {
    id: string
    address: string
    name: string
    underlyingAsset: string
    originator: string
    type: string
    positions: SubgraphPosition[]
  }
  tokenId: string
  user: string
  collateral: string
  maxCollateral: string
  normalDebt: string
  maxNormalDebt: string
  positionTransactions: {
    id: string
    type: string
    collateral: string
    normalDebt: string
    position: SubgraphPosition
  }[]
}

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

const fetchUserProxy = async (
  userAddress: string,
): Promise<{ id?: string; proxyAddress?: string }> => {
  const keys = '{id,proxyAddress}'
  const query = { query: `{userProxy(id: "${userAddress.toLowerCase()}")${keys}}` }
  return fetch(SUBGRAPH_API, {
    method: 'POST',
    body: JSON.stringify(query),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response.json())
    .then((jsonResponse) => jsonResponse.data.userProxy)
    .catch(() => ({}))
}

/**
 * Returns a collection of Position required by the frontend
 * @param {SubgraphPosition} position
 * @param {Web3Context['readOnlyAppProvider']} provider
 * @returns Promise<[Position, Array<PositionTransaction>]>
 */
const transformPosition = async (
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

  for (const positionTransaction of position.positionTransactions) {
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
const fetchPositions = async (
  userAddress: string,
  provider: Web3Context['readOnlyAppProvider'],
): Promise<[Position[], PositionTransaction[]]> => {
  const userProxy = await fetchUserProxy(userAddress)
  const proxyAddress = userProxy.proxyAddress?.toLowerCase()

  if (!proxyAddress) {
    return [[], []]
  }

  const vaultKeys = 'vault {id,name,address,underlyingAsset}'
  const transactionKeys = 'positionTransactions {id,type,collateral,normalDebt}'
  const keys = `{id,tokenId,user,collateral,normalDebt,${vaultKeys},${transactionKeys}}`
  const query = { query: `{positions(where: { user: "${proxyAddress}" })${keys}}` }

  const positionsData = await fetch(SUBGRAPH_API, {
    method: 'POST',
    body: JSON.stringify(query),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response.json())
    .then((jsonResponse) => jsonResponse.data.positions)

  const positionTransactions: PositionTransaction[] = []
  const positions: Position[] = []

  for (const position of positionsData) {
    const [newPosition, newPositionTransactions] = await transformPosition(position, provider)
    positions.push(newPosition)
    positionTransactions.push(...newPositionTransactions)
  }

  return [positions, positionTransactions]
}

/**
 * Fetches Position information by its ID
 *
 * @param {string} positionId
 * @param {Web3Context['readOnlyAppProvider']} provider
 * @returns {Promise<[Position, Array<PositionTransaction>]>}
 */
const fetchPositionById = (
  positionId: string,
  provider: Web3Context['readOnlyAppProvider'],
): Promise<[Position, PositionTransaction[]]> => {
  const vaultKeys = 'vault {id,name,address,underlyingAsset}'
  const transactionKeys = 'positionTransactions {id,type,collateral,normalDebt}'
  const keys = `{id,tokenId,user,collateral,normalDebt,${vaultKeys},${transactionKeys}}`
  const query = { query: `{position(id: "${positionId}")${keys}}` }

  return fetch(SUBGRAPH_API, {
    method: 'POST',
    body: JSON.stringify(query),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response.json())
    .then((jsonResponse) => jsonResponse.data.position)
    .then((position) => transformPosition(position, provider))
}

/**
 * Builds the information object for the Info Panels in Your Positions page
 * @param {Array<Position>} positions
 * @returns YourPositionPageInformation
 */
const fetchInfoPage = (positions: Position[]): YourPositionPageInformation => {
  const initialPositionInformation: YourPositionPageInformation = {
    totalDebt: 0,
    currentValue: 0,
    lowestHealthFactor: 0,
    nextMaturity: null,
  }

  return positions.reduce((acc, { discount, healthFactor, maturity, minted }) => {
    // totalDebt
    const totalDebt = acc.totalDebt + minted
    // currentValue
    const currentValue = acc.currentValue + discount

    // lowestHealthFactor
    const isNewLowest = acc.lowestHealthFactor === null || healthFactor < acc.lowestHealthFactor
    const lowestHealthFactor = isNewLowest ? healthFactor : acc.lowestHealthFactor

    // nextMaturity
    const maturityInMS = maturity.getTime()
    const nextMaturity =
      acc.nextMaturity === null ? maturityInMS : min([maturityInMS, acc.nextMaturity]).getTime()

    return { totalDebt, currentValue, lowestHealthFactor, nextMaturity }
  }, initialPositionInformation)
}

export { fetchPositionById, fetchPositions, fetchInfoPage }
