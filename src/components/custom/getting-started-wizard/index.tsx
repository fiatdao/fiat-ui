import s from './s.module.scss'
import Grid from '../grid'
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
import CongratsImg from '@/src/resources/svg/congrats.svg'
import useSWR from 'swr'
import { useMachine } from '@xstate/react'
import React, { useCallback, useEffect, useState } from 'react'
import { Button, Steps } from 'antd'
import YouTube from 'react-youtube'
import cn from 'classnames'

const { Step } = Steps

type initialStepsExpanded_type = {
  [key: number]: boolean
}

const initialStepsExpanded: initialStepsExpanded_type = {
  1: false,
  2: false,
  3: false,
  4: false,
}

const StepTitle: React.FC<{ step: number; toggleExpandedSteps: (step: number) => void }> = ({
  step,
  toggleExpandedSteps,
}) => (
  <Grid align="center" colsTemplate="1fr 30px" flow="col">
    <h3>{stepsData[step].title}</h3>
    <Button onClick={() => toggleExpandedSteps(step)} type="link">
      <ChevronDown />
    </Button>
  </Grid>
)

interface StepsContentProps {
  context: Context
  send: any
  step: number
}

const StepsContent: React.FC<StepsContentProps> = ({ context, send, step }: StepsContentProps) => {
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
          <Button href={'/'} onClick={() => send('NEXT')} target={'_blank'}>
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
              // TODO change this vaultAddress
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
          <Button onClick={() => send({ type: 'NEXT' })}>Mint FIAT</Button>
        </>
      )
    }
    default:
      return null
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

  const { skipped, totalSteps } = state.context

  // The state names are string, convert the current machine state to number.
  const currentStep = Number(state.toStrings()[0])

  const isSkipped = currentStep === 5 || skipped

  const [expandedSteps, setExpandedSteps] = useState({
    ...initialStepsExpanded,
    [currentStep]: true,
  })

  const toggleExpandedSteps = useCallback(
    (step: number) => {
      setExpandedSteps({ ...expandedSteps, [step]: !expandedSteps[step] })
    },
    [expandedSteps],
  )

  // Logic for stepStatus: check https://ant.design/components/steps/ for more info
  const calcStepStatus = (step: number) =>
    currentStep > step ? 'finish' : currentStep === step ? 'process' : 'wait'

  // Saving data to localStorage on state changes
  useEffect(() => {
    localStorage.setItem('getting-started-state', JSON.stringify(state))
  }, [state])

  // if currentStep changes, the previous step should be closed and the actual open.
  useEffect(() => {
    if (!isSkipped) setExpandedSteps({ ...initialStepsExpanded, [currentStep]: true })
  }, [currentStep, isSkipped])

  return (
    <div>
      {!isSkipped ? (
        <div>
          <div>
            <h2>Start using FIAT app in {totalSteps} simple steps</h2>
            <p>
              {isSkipped ? 4 : currentStep} of {totalSteps} steps completed
            </p>
          </div>
          <Button onClick={() => send({ type: 'SKIP' })}>Skip Guide</Button>
        </div>
      ) : (
        <div className={s.congrats}>
          <div>
            <CongratsImg />
          </div>
          <h4>Congratulations!</h4>
          <p>
            {totalSteps} of {totalSteps} completed
          </p>
          <Button href="/create-position">Go to the app</Button>
        </div>
      )}

      <Steps className="getting-started-steps" direction="vertical">
        {/* STEP 1*/}
        <Step
          description={
            expandedSteps[1] && <StepsContent context={state.context} send={send} step={1} />
          }
          status={calcStepStatus(1)}
          title={<StepTitle step={1} toggleExpandedSteps={toggleExpandedSteps} />}
        />

        {/* STEP 2 */}
        <Step
          description={
            expandedSteps[2] && <StepsContent context={state.context} send={send} step={2} />
          }
          status={calcStepStatus(2)}
          title={<StepTitle step={2} toggleExpandedSteps={toggleExpandedSteps} />}
        />

        {/* STEP 3 */}
        <Step
          description={
            expandedSteps[3] && <StepsContent context={state.context} send={send} step={3} />
          }
          status={calcStepStatus(3)}
          title={<StepTitle step={3} toggleExpandedSteps={toggleExpandedSteps} />}
        />

        {/* STEP 4 */}
        <Step
          description={
            expandedSteps[4] && <StepsContent context={state.context} send={send} step={4} />
          }
          status={calcStepStatus(4)}
          title={<StepTitle step={4} toggleExpandedSteps={toggleExpandedSteps} />}
        />
      </Steps>
    </div>
  )
}

export default GettingStartedWizard
