import { Dispatch, SetStateAction, createContext, useContext, useEffect, useState } from 'react'
import { useLocalStorage } from 'react-use-storage'
import { useNotifications } from '@/src/hooks/useNotifications'

export type GeneralContextType = {
  navOpen: boolean
  setNavOpen: Dispatch<SetStateAction<GeneralContextType['navOpen']>>
  theme: string
  title?: string
  isDarkTheme: boolean
  toggleDarkTheme: () => void
  setTitle: Dispatch<SetStateAction<GeneralContextType['title']>>
  resetTitle: () => void
  notification: ReturnType<typeof useNotifications>
}

const GeneralContext = createContext<GeneralContextType>({} as any)

const defaultTheme = 'dark'

const GeneralContextProvider: React.FC = ({ children }) => {
  const [navOpen, setNavOpen] = useState(false)
  const [theme, setTheme] = useLocalStorage('bb_theme', defaultTheme)
  const [title, setTitle] = useState<GeneralContextType['title']>()
  const notification = useNotifications()

  useEffect(() => {
    if (theme) {
      document.body.setAttribute('data-theme', theme)
    } else {
      document.body.removeAttribute('data-theme')
    }
  }, [theme])

  useEffect(() => {
    if (navOpen) {
      document.body.setAttribute('data-fixed', 'true')
    } else {
      document.body.removeAttribute('data-fixed')
    }
  }, [navOpen])

  return (
    <GeneralContext.Provider
      value={{
        navOpen,
        setNavOpen,
        theme,
        title,
        isDarkTheme: theme === 'dark',
        toggleDarkTheme: () => {
          setTheme(theme === 'dark' ? 'light' : 'dark')
        },
        setTitle,
        resetTitle: () => {
          setTitle(undefined)
        },
        notification,
      }}
    >
      {children}
    </GeneralContext.Provider>
  )
}

export default GeneralContextProvider

export function useGeneral(): GeneralContextType {
  return useContext<GeneralContextType>(GeneralContext)
}
