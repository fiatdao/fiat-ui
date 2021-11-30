import useSignature from './useSignature'
import { useRouter } from 'next/router'
import axios from 'axios'
import useSWR from 'swr'
import { ReactText, useRef } from 'react'
import { toast } from 'react-toastify'

import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { USER_ME } from '@/types/api'
import { API_URL, SIGN_IN_MESSAGE, SIGN_IN_STORAGE_KEY } from '@/src/constants/misc'
import { toastError } from '@/src/utils/toast'

type ReturnType = {
  user: USER_ME | null
  refetch: () => void
  signIn: () => void
  signInSignature: string | null
}
type Props = { redirectNotRegistered?: string; redirectOnUser?: string }

export default function useSignIn(props?: Props): ReturnType {
  const { address } = useWeb3Connection()
  const signInKey = `${SIGN_IN_STORAGE_KEY}:${address}`
  const toastId = useRef<ReactText | undefined>(undefined)

  const router = useRouter()
  const sign = useSignature()

  const getStorageSignature = () => window.localStorage.getItem(signInKey)

  const redirect = (user: USER_ME | null) => {
    if (user && props?.redirectOnUser) {
      router.push(props.redirectOnUser)
      return
    }

    if (!user && props?.redirectNotRegistered && getStorageSignature()) {
      router.push(props.redirectNotRegistered)
      return
    }
  }

  const { data: axiosData, mutate: refetch } = useSWR(['users/me', address], async (path) => {
    if (!getStorageSignature()) {
      return Promise.resolve({ data: null })
    }
    try {
      const res = await axios.get<USER_ME>(`${API_URL}/${path}`, {
        headers: { authorization: getStorageSignature() },
      })

      redirect(res.data)
      return res
    } catch (error: unknown) {
      const errorStatus = axios.isAxiosError(error) ? error.response?.status : undefined
      if (errorStatus !== 401) {
        window.localStorage.removeItem(signInKey)
        redirect(null)
        toast.dismiss(toastId.current)
        toastId.current = toastError('There was an error verifying the message signed.')
        return { data: null }
      }

      redirect(null)
      return { data: null }
    }
  })

  const signIn = async () => {
    if (!address) {
      return
    }

    const signedMessage = await sign(SIGN_IN_MESSAGE)
    if (!signedMessage) {
      return
    }
    window.localStorage.setItem(signInKey, signedMessage)
    refetch()
  }

  return { user: axiosData?.data || null, refetch, signIn, signInSignature: getStorageSignature() }
}
