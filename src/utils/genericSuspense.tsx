import { FC, ReactNode, Suspense } from 'react'
import Spin from '@/src/components/antd/spin'

export default function genericSuspense<T>(Element: FC<T>, fallback?: ReactNode) {
  return function GenericSuspenseReturnFunction(props: T) {
    return (
      <Suspense fallback={fallback ? fallback : <Spin />}>
        <Element {...props} />
      </Suspense>
    )
  }
}
