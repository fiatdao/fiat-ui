import { Maybe } from '@/types/utils'
import { useGeneral } from '@/src/providers/generalProvider'
import { useEffect } from 'react'

export const useDynamicTitle = (title?: Maybe<string>) => {
  const { resetTitle, setTitle } = useGeneral()

  useEffect(() => {
    if (title) {
      setTitle(title)
    }

    // resets title when unmounting component
    return () => resetTitle()
  }, [title, setTitle, resetTitle])
}
