import useUserProxy from '../useUserProxy'
import { ChainsValues } from '@/src/constants/chains'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { PositionTransactionAction_filter } from '@/types/subgraph/__generated__/globalTypes'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { Transactions, TransactionsVariables } from '@/types/subgraph/__generated__/Transactions'
import { TRANSACTIONS } from '@/src/queries/transactions'
import { ActionTransaction, Transaction, wrangleTransaction } from '@/src/utils/data/transactions'
import { Maybe, SwrResponse } from '@/types/utils'
import useSWR from 'swr'

const fetchTransactions = async (
  appChainId: ChainsValues,
  where: Maybe<PositionTransactionAction_filter>,
) => graphqlFetcher<Transactions, TransactionsVariables>(appChainId, TRANSACTIONS, { where })

export const useTransactions = (
  protocol?: string,
  action?: ActionTransaction,
  user?: Maybe<string>,
): SwrResponse<Transaction> => {
  const { appChainId } = useWeb3Connection()
  const { data, error } = useSWR(['transactions', protocol, action, user, appChainId], async () => {
    const where: Maybe<PositionTransactionAction_filter> = {}
    if (protocol) {
      where['vaultName'] = protocol
    }
    if (user) {
      where['user_contains_nocase'] = user.toLowerCase()
    }
    // @TODO: quick fix to hide deprecated vaults, filter by vaultName_not_contains deprecated
    where['vaultName_not_contains_nocase'] = 'deprecated'

    const { positionTransactionActions: transactions } = await fetchTransactions(appChainId, where)

    return transactions
      .sort((a, b) => +b.timestamp - +a.timestamp)
      .map((transaction) => wrangleTransaction(appChainId, transaction))
      .filter((transaction) => (action ? transaction.action.includes(action) : true))
  })

  return { data: data ?? [], error, loading: !data && !error }
}

export const useTransactionsByUser = () => {
  const { userProxyAddress } = useUserProxy()
  const { data = [], loading } = useTransactions(undefined, undefined, userProxyAddress)

  return { data, loading }
}
