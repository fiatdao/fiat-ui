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
  lastLTV: number
  minted: number
  maturity: Date
  healthFactor: number | null
  action: string
}

export type Transaction = {
  asset: string
  action: string
  amount: number
  lastAmount: number
  transactionHash: string
  date: Date
}

const SUBGRAPH_API =
  process.env.SUBGRAPH_API || 'https://api.thegraph.com/subgraphs/name/laimejesus/fiatlux'

const DELAY_TIME = 1000

const TRANSACTION_HISTORY_DATA: Transaction[] = [
  {
    asset: 'ePyvUSDC_12_31_21',
    action: 'Mint',
    amount: 179264.73,
    lastAmount: 179264.85,
    transactionHash: '0xcc09...2bfc',
    date: new Date(2021, 11, 22),
  },
  {
    asset: 'ePyvUSDC_12_31_21',
    action: 'Mint',
    amount: 179264.95,
    lastAmount: 179264.85,
    transactionHash: '0xcc09...2bfc',
    date: new Date(2021, 11, 22),
  },
  {
    asset: 'ePyvUSDC_12_31_21',
    action: 'Mint',
    amount: 179264.95,
    lastAmount: 179264.85,
    transactionHash: '0xcc09...2bfc',
    date: new Date(2021, 11, 22),
  },
  {
    asset: 'ePyvUSDC_12_31_21',
    action: 'Mint',
    amount: 179264.73,
    lastAmount: 179264.85,
    transactionHash: '0xcc09...2bfc',
    date: new Date(2021, 11, 22),
  },
]

const transactionMockFetch = () => {
  return new Promise((res) => {
    setTimeout(() => {
      res(TRANSACTION_HISTORY_DATA)
    }, DELAY_TIME)
  })
}

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

const transformPositions = async (positions: any[], provider: any): Promise<Position[]> => {
  const newPositions = []
  for (const position of positions) {
    const vaultAddress = position.vault
    const tokenId = position.tokenId
    const fiat = bigNumberToDecimal(position.normalDebt)
    const maturity = await vaultEPTCall(vaultAddress, provider, 'maturity', [tokenId])
    const trancheAddress = await vaultEPTCall(vaultAddress, provider, 'getTokenAddress', [tokenId])
    // const underlierToken = await vaultEPTCall(vaultAddress, provider, "underlierToken", null);
    const discount = await vaultEPTCall(vaultAddress, provider, 'fairPrice', [tokenId, true, true])
    const name = await trancheCall(trancheAddress!, provider, 'name', null)
    const decimals = await trancheCall(trancheAddress!, provider, 'decimals', null)
    // @TODO
    const ltv = 82
    const lastLTV = 90
    const healthFactor = 1
    const newMaturity = maturity?.mul(1000).toNumber() || Date.now()

    const newPosition: Position = {
      name: name!,
      discount: bigNumberToDecimal(discount, decimals!),
      minted: fiat,
      maturity: new Date(newMaturity),
      action: 'manage',
      ltv: ltv,
      lastLTV: lastLTV,
      healthFactor,
    }
    newPositions.push(newPosition)
  }
  return newPositions
}

// @TODO: currently working for element-fi
const fetchPositions = async (userAddress: string, provider: any): Promise<Position[]> => {
  const userProxy = await fetchUserProxy(userAddress)
  const proxyAddress = userProxy.proxyAddress.toLowerCase()
  const keys = '{id,vault,tokenId,user,collateral,normalDebt}}'
  const query = { query: `{positions(where: { user: "${proxyAddress}" })${keys}` }
  const positions = await fetch(SUBGRAPH_API, {
    method: 'POST',
    body: JSON.stringify(query),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response.json())
    .then((jsonResponse) => jsonResponse.data.positions)
  const newPositions = await transformPositions(positions, provider)
  return newPositions
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
    nextMaturity: remainingTime(nextMaturity!),
  })
}

export { transactionMockFetch, fetchPositions, fetchInfoPage }
