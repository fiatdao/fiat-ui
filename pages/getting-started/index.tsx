import GettingStartedWizard from '@/src/components/custom/getting-started-wizard'
import { Suspense } from 'react'

const GettingStarted = () => {
  return (
    <>
      <Suspense fallback="">
        <GettingStartedWizard />
      </Suspense>
    </>
  )
}

export default GettingStarted
