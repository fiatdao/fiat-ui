import axios from 'axios'
import { ReactElement, ReactNode, createContext, useContext, useState } from 'react'

import useSWR from 'swr'
import { API_URL } from '@/src/constants/misc'
import { SALE } from '@/types/api'

const AppStatusContext = createContext<({ refetch: () => void } & SALE) | null>(null)

type Props = {
  fallback: ReactElement
  children: ReactNode
}

export default function AppStatusProvider({ children, fallback }: Props) {
  const [isLoading, setIsLoading] = useState(true)

  const { data: appStatus, mutate: refetch } = useSWR(
    '/sale',
    async () => {
      try {
        const res = await axios.get<SALE>(`${API_URL}/sale`)

        return res.data
      } catch (error: unknown) {
        throw 'There was an error trying to fetch app status'
      } finally {
        setIsLoading(false)
      }
    },
    { suspense: false },
  )

  if (isLoading) {
    return fallback
  }

  return (
    <AppStatusContext.Provider value={appStatus ? { ...appStatus, refetch } : null}>
      {children}
    </AppStatusContext.Provider>
  )
}

export function useAppStatus() {
  const context = useContext(AppStatusContext)
  if (context === null) {
    throw new Error('useAppStatus must be used within a AppStatusProvider')
  }
  return context
}
