export type PositionTransaction = {
  asset: string
  action: string
  amount: number
  deltaAmount: number // does not exist in the scheme
  transactionHash: string
  date: Date
}
export {}
