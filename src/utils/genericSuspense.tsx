import { FC, ReactNode, Suspense } from 'react'
import { Loading } from '@/src/components/common/Loading'

export default function genericSuspense<T>(Element: FC<T>, fallback?: ReactNode) {
  return function GenericSuspenseReturnFunction(props: T) {
    return (
      <Suspense fallback={fallback ? fallback : <Loading />}>
        <Element {...props} />
      </Suspense>
    )
  }
}
