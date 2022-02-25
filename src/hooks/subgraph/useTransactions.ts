import useSWR from 'swr'
import { PositionTransactionAction_filter } from '@/types/subgraph/__generated__/globalTypes'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { Transactions, TransactionsVariables } from '@/types/subgraph/__generated__/Transactions'
import { TRANSACTIONS } from '@/src/queries/transactions'
import { ActionTransaction, Transaction, wrangleTransaction } from '@/src/utils/data/transactions'
import { Maybe, SwrResponse } from '@/types/utils'

const fetchTransactions = async (where: Maybe<PositionTransactionAction_filter>) =>
  graphqlFetcher<Transactions, TransactionsVariables>(TRANSACTIONS, { where })

export const useTransactions = (
  protocol?: string,
  action?: ActionTransaction,
): SwrResponse<Transaction> => {
  // TODO __typename doesnt work for $where
  const { data, error } = useSWR(['transactions', protocol, action], async () => {
    const where: Maybe<PositionTransactionAction_filter> = protocol ? { vaultName: protocol } : null
    const { positionTransactionActions: transactions } = await fetchTransactions(where)
    return transactions
      .map((tx) => wrangleTransaction(tx))
      .filter((tx) => (action ? tx.action !== action : true))
  })

  return { data: data ?? [], error, loading: !data && !error }
}
