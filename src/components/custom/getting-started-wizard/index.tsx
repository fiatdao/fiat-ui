import s from './s.module.scss'
import Grid from '../grid'
import { NullEvent } from 'xstate/lib/types'
import cn from 'classnames'
import YouTube from 'react-youtube'
import { Button, Steps } from 'antd'
import React, { useEffect, useState } from 'react'
import { useMachine } from '@xstate/react'
import useSWR from 'swr'
import { FDTTokenImage, FIATTokenImage } from '@/src/components/custom/side-menu-footer'
import { contracts } from '@/src/constants/contracts'
import { Chains } from '@/src/constants/chains'
import { AddTokenButton } from '@/src/components/custom/add-token-button'
import { Step, stepsData } from '@/src/components/custom/getting-started-wizard/steps-data'
import gettingStartedMachine, {
  Context,
} from '@/src/components/custom/getting-started-wizard/state'
import CheckIcon from '@/src/resources/svg/circle-check-icon.svg'
import ChevronDown from '@/src/resources/svg/chevron-down.svg'

const { Step } = Steps

const initialStepsExpanded = {
  1: false,
  2: false,
  3: false,
  4: false,
}

const StepTitle: React.FC<{ step: number; toggleExpandStep: (step: number) => void }> = ({
  step,
  toggleExpandStep,
}) => (
  <Grid align="center" colsTemplate="1fr 30px" flow="col">
    <h3>{stepsData[step].title}</h3>
    <Button onClick={() => toggleExpandStep(step)} type="link">
      <ChevronDown />
    </Button>
  </Grid>
)

// @ts-ignore
const StepsContent: React.FC<{ context: Context; send: any; step: number }> = ({
  context,
  send,
  step,
}) => {
  const {
    assetMaturityVideoComplete,
    discountRateVideoComplete,
    fdtTokenIsAdded,
    fiatTokenIsAdded,
    healthScoreVideoComplete,
  } = context

  switch (step) {
    case 1: {
      return (
        <>
          <p>{stepsData[1].description}</p>
          <div className={s.videoContainer}>
            <YouTube title="Video2" videoId="ScMzIvxBSi4" />
          </div>
          <Button
            href={'/'}
            onClick={() => {
              send('NEXT')
            }}
            target={'_blank'}
          >
            Go to Dashboard
          </Button>
        </>
      )
    }
    case 2: {
      return (
        <>
          <p>{stepsData[2].description}</p>

          <p>ADD TO WALLET</p>
          <Grid colsTemplate="1fr 1fr" flow="row" gap={8}>
            <AddTokenButton
              address={contracts.FIAT.address[Chains.goerli]}
              decimals={18}
              disabled={fiatTokenIsAdded}
              extraContent={fiatTokenIsAdded ? <CheckIcon /> : null}
              image={FIATTokenImage}
              onStatusChange={(status) => status === 'success' && send({ type: 'ADD_FIAT' })}
              symbol="FDT"
            />

            <AddTokenButton
              // TODO change this address
              address={contracts.FIAT.address[Chains.goerli]}
              decimals={18}
              disabled={fdtTokenIsAdded}
              extraContent={fdtTokenIsAdded ? <CheckIcon /> : null}
              image={FDTTokenImage}
              onStatusChange={(status) => status === 'success' && send({ type: 'ADD_FDT' })}
              symbol="FDT"
            />
          </Grid>

          <Button
            disabled={!fiatTokenIsAdded || !fdtTokenIsAdded}
            onClick={() => send({ type: 'NEXT' })}
          >
            Next Step
          </Button>
        </>
      )
    }
    case 3: {
      return (
        <>
          <p>
            <CheckIcon className={cn({ [s.iconDisabled]: !discountRateVideoComplete })} />
            3.1 Discount Rate
          </p>
          <div className={s.videoContainer}>
            <YouTube
              onEnd={() => send({ type: 'COMPLETE_DISCOUNT_RATE_VIDEO' })}
              title="3.1 Discount Rate"
              videoId="ScMzIvxBSi4"
            />
          </div>
          <p>
            <CheckIcon className={cn({ [s.iconDisabled]: !healthScoreVideoComplete })} />
            3.2 Health Score
          </p>
          <div className={s.videoContainer}>
            <YouTube
              onEnd={() => send({ type: 'COMPLETE_HEALTH_SCORE_VIDEO' })}
              title="3.2 Health Score"
              videoId="ScMzIvxBSi4"
            />
          </div>
          <p>
            <CheckIcon className={cn({ [s.iconDisabled]: !assetMaturityVideoComplete })} />
            3.3 Asset Maturity
          </p>
          <div className={s.videoContainer}>
            <YouTube
              onEnd={() => send({ type: 'COMPLETE_ASSET_MATURITY_VIDEO' })}
              title="3.3 Asset Maturity"
              videoId="ScMzIvxBSi4"
            />
          </div>
        </>
      )
    }
    case 4: {
      return (
        <>
          <p>{stepsData[4].description}</p>

          <Grid colsTemplate="1fr 1fr" flow="row" gap={24} width="100%">
            <div>
              <p>Video 1</p>
              <div className={s.videoContainer}>
                <YouTube title="Video1" videoId="ScMzIvxBSi4" />
              </div>
            </div>
            <div>
              <p>Video 2</p>
              <div className={s.videoContainer}>
                <YouTube title="Video2" videoId="ScMzIvxBSi4" />
              </div>
            </div>
          </Grid>
          <Button
            href={'/open-position'}
            onClick={() => {
              send({ type: 'SKIP' })
            }}
          >
            Mint FIAT
          </Button>
        </>
      )
    }
  }
}

const GettingStartedWizard = () => {
  // Get localStorage data state with SSR; if there isn't, return the initial state
  const { data: persistedState } = useSWR('getting-started-state', (key) => {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : gettingStartedMachine.initialState
  })

  // Put the data in the machine
  const [state, send] = useMachine(gettingStartedMachine, {
    state: persistedState,
  })

  const { totalSteps } = state.context

  // The state names are string, convert the current machine state to number.
  const currentStep = Number(state.toStrings()[0])

  const [expandedSteps, setExpandedSteps] = useState(initialStepsExpanded)

  const toggleExpandStep = (step: number) => {
    // @ts-ignore
    setExpandedSteps({ ...expandedSteps, [step]: !expandedSteps[step] })
  }

  // Saving data to localStorage on state changes
  useEffect(() => {
    localStorage.setItem('getting-started-state', JSON.stringify(state))
  }, [state])

  useEffect(() => {
    setExpandedSteps({ ...expandedSteps, [currentStep]: true, [currentStep - 1]: false })

    // We don't need the expandedSteps dependency here, but we need the value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep])
  return (
    <>
      <div>
        <div>
          <h2>Start using FIAT app in {totalSteps} simple steps</h2>
          <p>
            {currentStep === 5 ? 4 : currentStep} of {totalSteps} steps completed
          </p>
        </div>
        {currentStep !== 5 && (
          <Button href={'/'} onClick={() => send({ type: 'SKIP' })}>
            Skip Guide
          </Button>
        )}
      </div>

      <Steps current={currentStep - 1} direction="vertical">
        {/* STEP 1*/}
        <Step
          description={
            expandedSteps[1] && <StepsContent context={state.context} send={send} step={1} />
          }
          status={currentStep > 1 ? 'finish' : 'process'}
          title={<StepTitle step={1} toggleExpandStep={toggleExpandStep} />}
        />

        {/* STEP 2 */}
        <Step
          description={
            expandedSteps[2] && <StepsContent context={state.context} send={send} step={2} />
          }
          status={currentStep > 2 ? 'finish' : currentStep === 2 ? 'process' : 'wait'}
          title={<StepTitle step={2} toggleExpandStep={toggleExpandStep} />}
        />

        {/* STEP 3 */}
        <Step
          description={
            expandedSteps[3] && <StepsContent context={state.context} send={send} step={3} />
          }
          status={currentStep > 3 ? 'finish' : currentStep === 3 ? 'process' : 'wait'}
          title={<StepTitle step={3} toggleExpandStep={toggleExpandStep} />}
        />

        {/* STEP 4 */}
        <Step
          description={
            expandedSteps[4] && <StepsContent context={state.context} send={send} step={4} />
          }
          status={currentStep > 4 ? 'finish' : currentStep === 4 ? 'process' : 'wait'}
          title={<StepTitle step={4} toggleExpandStep={toggleExpandStep} />}
        />
      </Steps>
    </>
  )
}

export default GettingStartedWizard
