import { GeneralError } from '@/src/components/custom/general-error'
import ErrorBoundary from '@/src/components/custom/error-boundary'
import React, { Suspense } from 'react'

type Props = {
  children: React.ReactNode
  fallback?: JSX.Element
}

function DefaultFallback(): JSX.Element {
  return <></>
}

export default function SafeSuspense({
  children,
  fallback = <DefaultFallback />,
}: Props): JSX.Element {
  return (
    <ErrorBoundary fallbackRender={(props: any) => <GeneralError {...props} />}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  )
}
