import { useEffect } from 'react'
import { Maybe } from '@/types/utils'
import { useGeneral } from '@/src/providers/generalProvider'

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
