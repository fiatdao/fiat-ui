import trancheCall from './callTranche'
import vaultEPTCall from './callVaultEPT'
import { bigNumberToDecimal } from './formats'
import { remainingTime } from './your-positions-utils'
import { min } from 'date-fns'

export type YourPositionPageInformation = {
  totalDebt: number
  currentValue: number
  lowestHealthFactor: number | null
  nextMaturity: string
}

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

const SUBGRAPH_API = process.env.NEXT_PUBLIC_REACT_APP_SUBGRAPH_API || ''

const fetchUserProxy = async (userAddress: string) => {
  const keys = '{id,proxyAddress}'
  const query = { query: `{userProxy(id: "${userAddress.toLowerCase()}")${keys}}` }
  return fetch(SUBGRAPH_API, {
    method: 'POST',
    body: JSON.stringify(query),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response.json())
    .then((jsonResponse) => jsonResponse.data.userProxy)
}

const transformPosition = async (
  position: any,
  provider: any,
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
  for (const positionTransaction of position.positionTransactions) {
    const collateral = bigNumberToDecimal(positionTransaction.collateral)
    const deltaCollateral = bigNumberToDecimal(positionTransaction.deltaCollateral)
    const newPositionTransaction: PositionTransaction = {
      asset: name!,
      action: positionTransaction.type,
      amount: collateral,
      deltaAmount: deltaCollateral,
      transactionHash: positionTransaction.id,
      date: new Date(newMaturity),
    }
    newPositionTransactions.push(newPositionTransaction)
  }
  console.log(newPositionTransactions)
  return [newPosition, newPositionTransactions]
}

// @TODO: currently working for element-fi
const fetchPositions = async (
  userAddress: string,
  provider: any,
): Promise<[Position[], PositionTransaction[]]> => {
  const userProxy = await fetchUserProxy(userAddress)
  if (!userProxy) return [[], []]

  const proxyAddress = userProxy.proxyAddress.toLowerCase()
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
  const positions = []
  for (const position of positionsData) {
    const [newPosition, newPositionTransactions] = await transformPosition(position, provider)
    positions.push(newPosition)
    positionTransactions.push(...newPositionTransactions)
  }
  return [positions, positionTransactions]
}

const fetchInfoPage = (positions: any[]): Promise<YourPositionPageInformation> => {
  let totalDebt = 0
  let currentValue = 0
  let lowestHealthFactor: number | null = null
  let nextMaturity: Date | null = null
  positions.forEach((position) => {
    totalDebt += position.minted
    currentValue += position.discount
    lowestHealthFactor = !lowestHealthFactor
      ? position.healthFactor
      : position.healthFactor < lowestHealthFactor
      ? position.healthFactor
      : lowestHealthFactor
    nextMaturity = !nextMaturity ? position.maturity : min([position.maturity, nextMaturity])
  })
  return Promise.resolve({
    totalDebt,
    currentValue,
    lowestHealthFactor,
    nextMaturity: remainingTime(nextMaturity),
  })
}

export { fetchPositions, fetchInfoPage }
