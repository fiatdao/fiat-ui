import React, { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

type Props = {
  children: React.ReactNode
  fallback?: JSX.Element
  error?: JSX.Element | null
}

function DefaultFallback(): JSX.Element {
  return <></>
}

export default function SafeSuspense({
  children,
  fallback = <DefaultFallback />,
  error = null,
}: Props): JSX.Element {
  return (
    <ErrorBoundary fallback={error}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  )
}
