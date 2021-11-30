import { ReactText, useCallback, useRef } from 'react'

import { Contract, ContractTransaction } from '@ethersproject/contracts'
import { toast } from 'react-toastify'

import { ExternalLink, Link } from '@/src/components/pureStyledComponents/text/Link'
import { ChainAppContractInfo } from '@/src/constants/contracts'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { TransactionError } from '@/src/utils/TransactionError'
import { toastError, toastSuccess, toastWarning, toastWorking } from '@/src/utils/toast'

export type QueryOptions = {
  refetchInterval: number
}

export default function useTransaction<
  MyContract extends Contract,
  Method extends keyof MyContract,
  Params extends Parameters<MyContract[Method]>,
>(contractInfo: ChainAppContractInfo, method: Method) {
  const { getExplorerUrl, isAppConnected, web3Provider } = useWeb3Connection()

  const toastId = useRef<ReactText | undefined>(undefined)

  return useCallback(
    async (...params: Params) => {
      const signer = web3Provider?.getSigner()
      if (!signer) {
        toastId.current = toastError('Transaction failed, there is no provider')
        return null
      }

      if (!isAppConnected) {
        toast.dismiss(toastId.current)
        toastId.current = toastError('ERROR: App is not connected')
        return null
      }

      const contract = new Contract(contractInfo.address, contractInfo.abi, signer) as MyContract

      let tx: ContractTransaction
      try {
        toast.dismiss(toastId.current)
        toastId.current = toastWorking('Plase sign the transaction.')
        tx = await contract[method](...params)
        toast.dismiss(toastId.current)
        toastId.current = toastWorking(
          <>
            Awaiting tx execution,{' '}
            <Link href={getExplorerUrl(tx.hash)} referrerPolicy="no-referrer" target="_blank">
              view on explorer <ExternalLink />
            </Link>
          </>,
          false,
        )
      } catch (e: any) {
        const error = new TransactionError(
          e.data?.message || e.message || 'Unable to decode revert reason',
          e.data?.code || e.code,
          e.data,
        )
        if (error.code === 4001) {
          toast.dismiss(toastId.current)
          toastId.current = toastWarning('User denied signature')
          return null
        }

        toast.dismiss(toastId.current)
        toastId.current = toastError(error.message)
        return null
      }

      try {
        const receipt = await tx.wait()
        toast.dismiss(toastId.current)
        toastId.current = toastSuccess(
          <>
            Transaccion success,{' '}
            <Link href={getExplorerUrl(tx.hash)} referrerPolicy="no-referrer" target="_blank">
              view on explorer <ExternalLink />
            </Link>
          </>,
        ) // receipt.transactionHash
        return receipt
      } catch (e: any) {
        const error = new TransactionError(
          e.data?.message || e.message || 'Unable to decode revert reason',
          e.data?.code || e.code,
          e.data,
        )
        toast.dismiss(toastId.current)
        toastId.current = toastError(error.message)
        return null
      }
    },
    [web3Provider, contractInfo, isAppConnected, method, getExplorerUrl],
  )
}
