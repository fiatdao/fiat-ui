import { useWeb3Connection } from '../providers/web3ConnectionProvider'
import { toast } from 'react-toastify'
import { ReactText, useCallback, useRef } from 'react'

import { toastError, toastSuccess, toastWorking } from '@/src/utils/toast'

export default function useSignature() {
  const { web3Provider } = useWeb3Connection()
  const toastId = useRef<ReactText | undefined>(undefined)

  return useCallback(
    async (data: unknown) => {
      toast.dismiss(toastId.current)
      toastId.current = toastWorking('Please, sign the transaction.')

      if (!web3Provider) {
        return null
      }

      try {
        // TODO: optional chaining not necessary as web3Provider will be available at this point
        const signer = await web3Provider?.getSigner()
        // TODO: `getSigner` always returns a JsonRpcSigner, so we don't need to check for its existence
        const signature = await signer?.signMessage(
          typeof data === 'string' ? data : JSON.stringify(data),
        )
        toast.dismiss(toastId.current)
        toastId.current = toastSuccess('Successfully Message signed.')
        return signature
      } catch (error: unknown) {
        toast.dismiss(toastId.current)
        toastId.current = toastError('Error trying to sign message.')
        return null
      }
    },
    [web3Provider],
  )
}
