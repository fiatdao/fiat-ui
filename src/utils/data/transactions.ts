import { BigNumberToDateOrCurrent } from '../dateTime'
import { getHumanValue } from '@/src/web3/utils'
import { Transactions_positionTransactionActions as SubgraphTransaction } from '@/types/subgraph/__generated__/Transactions'

export type ActionTransaction = SubgraphTransaction['__typename']
export type Transaction = {
  vaultName: string
  underlierSymbol: string
  asset: string
  action: ActionTransaction
  amount: number
  deltaAmount: number
  transactionHash: string
  date: Date
}

export const ACTIONS_TYPES: Record<ActionTransaction, string> = {
  ConfiscateCollateralAndDebtAction: 'Burn',
  TransferCollateralAndDebtAction: 'Transfer',
  ModifyCollateralAndDebtAction: 'Mint',
}

const wrangleTransaction = (transaction: SubgraphTransaction): Transaction => {
  const tx = {
    vaultName: transaction.vaultName ?? '',
    underlierSymbol: transaction.position.collateral?.underlierSymbol ?? '',
    asset: transaction.position.collateral?.symbol ?? '',
    action: transaction.__typename,
    transactionHash: transaction.transactionHash,
    amount: getHumanValue(transaction.collateral, 18)?.toNumber() ?? 0,
    deltaAmount: getHumanValue(transaction.deltaCollateral, 18)?.toNumber() ?? 0,
    date: BigNumberToDateOrCurrent(transaction.position.maturity),
  }

  // FIXME Remove and return object directly after debug
  console.log({ tx })
  return tx
}
export { wrangleTransaction }
