import { useEffect } from 'react'
import { useGeneral } from '@/src/providers/generalProvider'

export const useDynamicTitle = (title?: string) => {
  const { resetTitle, setTitle } = useGeneral()

  useEffect(() => {
    if (title) {
      setTitle(title)
    }

    // resets title when unmounting component
    return () => resetTitle()
  }, [title, setTitle, resetTitle])
}
