import { stringToDateOrCurrent } from '@/src/utils/dateTime'
import { ChainsValues } from '@/src/constants/chains'
import { getCollateralMetadata } from '@/src/constants/bondTokens'
import { getHumanValue } from '@/src/web3/utils'
import { Transactions_positionTransactionActions as SubgraphTransaction } from '@/types/subgraph/__generated__/Transactions'
import { WAD_DECIMALS } from '@/src/constants/misc'

export type ActionTransaction = SubgraphTransaction['__typename']
export type Transaction = {
  protocol: string
  symbol: string
  vaultName: string
  underlierSymbol: string
  asset: string
  action: ActionTransaction
  amount: number
  deltaAmount: number
  transactionHash: string
  date: Date
  assetAddress: string
}

export const ACTIONS_TYPES: Record<ActionTransaction, string> = {
  ConfiscateCollateralAndDebtAction: 'Burn',
  TransferCollateralAndDebtAction: 'Transfer',
  ModifyCollateralAndDebtAction: 'Modify',
}

const wrangleTransaction = (
  appChainId: ChainsValues,
  transaction: SubgraphTransaction,
): Transaction => {
  const { protocol = '', symbol = '' } =
    getCollateralMetadata(appChainId, {
      vaultAddress: transaction.vault?.address,
      tokenId: transaction.position.collateralType?.tokenId,
    }) ?? {}

  return {
    protocol,
    symbol,
    vaultName: transaction.vaultName ?? '',
    underlierSymbol: transaction.position.collateralType?.underlierSymbol ?? '',
    asset: transaction.position.collateralType?.symbol ?? '',
    action: transaction.__typename,
    transactionHash: transaction.transactionHash,
    amount: getHumanValue(transaction.collateral, WAD_DECIMALS)?.toNumber() ?? 0,
    deltaAmount: getHumanValue(transaction.deltaCollateral, WAD_DECIMALS)?.toNumber() ?? 0,
    date: stringToDateOrCurrent(transaction.timestamp),
    assetAddress: transaction.position.collateralType?.address ?? '',
  }
}
export { wrangleTransaction }
