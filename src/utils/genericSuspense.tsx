import { FC, ReactNode, Suspense } from 'react'

export default function genericSuspense<T>(Element: FC<T>, fallback?: ReactNode) {
  return function GenericSuspenseReturnFunction(props: T) {
    return (
      <Suspense fallback={fallback ? fallback : <div>Loading...</div>}>
        <Element {...props} />
      </Suspense>
    )
  }
}
