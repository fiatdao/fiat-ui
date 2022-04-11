import { Suspense } from 'react'
import GettingStartedWizard from '@/src/components/custom/getting-started-wizard'

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
