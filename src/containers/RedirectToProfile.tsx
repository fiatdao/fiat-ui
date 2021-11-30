import { useRouter } from 'next/router'
import { useEffect } from 'react'

import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { SIGN_IN_STORAGE_KEY } from '@/src/constants/misc'

const securedPages = ['/register']

export default function RedirectToProfile() {
  const { address } = useWeb3Connection()
  const signInKey = `${SIGN_IN_STORAGE_KEY}:${address}`
  const signInSignature = window.localStorage.getItem(signInKey) || null
  const router = useRouter()

  useEffect(() => {
    if (signInSignature === null && securedPages.includes(router.pathname)) {
      router.push('/')
    }
  }, [router, signInSignature])

  return null
}
