import useUserProxy from '../useUserProxy'
import useSWR from 'swr'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
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
  user?: Maybe<string>,
): SwrResponse<Transaction> => {
  const { readOnlyAppProvider } = useWeb3Connection()
  const { data, error } = useSWR(['transactions', protocol, action], async () => {
    const where: Maybe<PositionTransactionAction_filter> = {}
    if (protocol) {
      where['vaultName'] = protocol
    }
    if (user) {
      where['user'] = user
    }
    const { positionTransactionActions: transactions } = await fetchTransactions(where)

    const txsReceipts = await Promise.all(
      transactions.map(({ transactionHash }) =>
        readOnlyAppProvider.getTransactionReceipt(transactionHash),
      ),
    )
    const blocksInfo = await Promise.all(
      txsReceipts.map(({ blockHash }) => readOnlyAppProvider.getBlock(blockHash)),
    )

    return blocksInfo
      .map(({ timestamp }, index) => ({
        timestamp,
        ...transactions[index],
      }))
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(wrangleTransaction)
      .filter((tx) => (action ? tx.action.includes(action) : true))
  })

  return { data: data ?? [], error, loading: !data && !error }
}

export const useTransactionsByUser = () => {
  const { userProxyAddress } = useUserProxy()
  const { data = [], loading } = useTransactions(undefined, undefined, userProxyAddress)

  return { data, loading }
}
