import { toast } from 'react-toastify'
import axios from 'axios'
import { ReactText, useCallback, useRef } from 'react'

import { USER } from '@/types/api'
import { toastError, toastSuccess } from '@/src/utils/toast'
import { API_URL } from '@/src/constants/misc'

type Params = { formData: USER; signature: string; walletAddress: string; method: 'post' | 'patch' }

export default function useSubmitRegister() {
  const toastId = useRef<ReactText | undefined>(undefined)

  return useCallback(async ({ formData, method, signature, walletAddress }: Params) => {
    const url = method === 'post' ? '/users' : `/users/${walletAddress}`
    const body = method === 'post' ? { ...formData, address: walletAddress } : formData

    toast.dismiss(toastId.current)
    let res: boolean

    try {
      await axios[method](`${API_URL}${url}`, body, {
        headers: { authorization: signature },
      })
      res = true
    } catch (error: unknown) {
      res = false
    }

    toastId.current = res
      ? toastSuccess('User data updated.')
      : toastError('Error trying to update user data.')
    return res
  }, [])
}
