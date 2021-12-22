export type YourPositionPageInformation = {
  totalDebt: string
  currentValue: string
  lowestHealthFactor: number | null
  nextMaturity: string
}

export type Inventory = {
  name: string
  discount: string
  ltv: number
  lastLTV: number
  minted: string
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

const DELAY_TIME = 1000

const YOUR_POSITION_PAGE_DATA: YourPositionPageInformation = {
  totalDebt: '750,000,000',
  currentValue: '$1,000,000.00',
  lowestHealthFactor: 1.01,
  nextMaturity: '12d:5h:13m',
}

const INVENTORY_DATA: Inventory[] = [
  {
    name: 'bb_sBOND_cDAI',
    discount: '$500,000.00',
    ltv: 82,
    lastLTV: 90,
    minted: '0',
    maturity: new Date(2021, 11, 24),
    healthFactor: null,
    action: 'manage',
  },
  {
    name: 'ePyvUSDC_12_31_21',
    discount: '$500,000.00',
    ltv: 93,
    lastLTV: 90,
    minted: '400,000',
    maturity: new Date(2021, 11, 25),
    healthFactor: 1.01,
    action: 'manage',
  },
  {
    name: 'fDAI_12_31_21',
    discount: '$500,000.00',
    ltv: 82,
    lastLTV: 90,
    minted: '0',
    maturity: new Date(2022, 11, 15),
    healthFactor: null,
    action: 'manage',
  },
  {
    name: 'bb_sBond_cUSDC',
    discount: '$200,000.00',
    ltv: 90,
    lastLTV: 78,
    minted: '100,000',
    maturity: new Date(),
    healthFactor: 4.5,
    action: 'manage',
  },
]

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

const inventoryMockFetch = () => {
  return new Promise((res) => {
    setTimeout(() => {
      res(INVENTORY_DATA)
    }, DELAY_TIME)
  })
}

const yourPositionPageInformationMockFetch = () => {
  return new Promise((res) => {
    setTimeout(() => {
      res(YOUR_POSITION_PAGE_DATA)
    }, DELAY_TIME)
  })
}

const transactionMockFetch = () => {
  return new Promise((res) => {
    setTimeout(() => {
      res(TRANSACTION_HISTORY_DATA)
    }, DELAY_TIME)
  })
}

export { inventoryMockFetch, yourPositionPageInformationMockFetch, transactionMockFetch }
