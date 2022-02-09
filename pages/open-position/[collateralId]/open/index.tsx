import s from './s.module.scss'
import AntdForm from 'antd/lib/form'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useMachine } from '@xstate/react'
import cn from 'classnames'
import stepperMachine, { TITLES_BY_STEP } from '@/src/state/open-position-form'
import { contracts } from '@/src/constants/contracts'
import { DEFAULT_ADDRESS, getHumanValue } from '@/src/web3/utils'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { useTokenSymbol } from '@/src/hooks/contracts/useTokenSymbol'
import genericSuspense from '@/src/utils/genericSuspense'
import { Form } from '@/src/components/antd'
import TokenAmount from '@/src/components/custom/token-amount'
import { RadioTab, RadioTabsWrapper } from '@/src/components/antd/radio-tab'
import { BackButton } from '@/src/components/custom/back-button'
import ElementIcon from '@/src/resources/svg/element.svg'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import Plus from '@/src/resources/svg/gradient-plus.svg'
import Less from '@/src/resources/svg/gradient-less.svg'
import Success from '@/src/resources/svg/success.svg'
import useUserProxy from '@/src/hooks/useUserProxy'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { ERC20 } from '@/types/typechain'
import { useUserActions } from '@/src/hooks/useUserActions'
import { useERC20Allowance } from '@/src/hooks/useERC20Allowance'
import { InfoBlock } from '@/src/components/custom/info-block'
import ButtonGradient from '@/src/components/antd/button-gradient'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import { PositionFormsLayout } from '@/src/components/custom/position-forms-layout'

const StepperTitle: React.FC<{
  currentStep: number
  description: string
  title: string
  totalSteps: number
}> = ({ currentStep, description, title, totalSteps }) => (
  <div className={cn(s.stepperWrapper)}>
    <div className={cn(s.stepperTitleWrapper)}>
      <h2 className={cn(s.stepperTitle)}>{title}</h2>
      <div className={s.steps}>
        <span className={s.currentStep}>{currentStep}</span>/{totalSteps}
      </div>
    </div>
    <p className={cn(s.stepperDescription)}>{description}</p>
  </div>
)

const Summary: React.FC = () => {
  const hfState = 'ok'

  return (
    <div className={s.summary}>
      <div className={s.summaryRow}>
        <div className={s.summaryTitle}>In your wallet</div>
        <div className={s.summaryValue}>5,000 DAI Principal Token</div>
      </div>
      <div className={s.summaryRow}>
        <div className={s.summaryTitle}>Depositing into position </div>
        <div className={s.summaryValue}>5,000 DAI Principal Token</div>
      </div>
      <div className={s.summaryRow}>
        <div className={s.summaryTitle}>Remaining in wallet</div>
        <div className={s.summaryValue}>0 DAI Principal Token</div>
      </div>
      <div className={s.summaryRow}>
        <div className={s.summaryTitle}>FIAT to be minted</div>
        <div className={s.summaryValue}>2,000</div>
      </div>
      <div className={s.summaryRow}>
        <div className={s.summaryTitle}>Updated health factor</div>
        <div
          className={cn(
            s.summaryValue,
            { [s.ok]: hfState === 'ok' },
            // TODO: Make these work
            // { [s.warning]: hfState === 'warning' },
            // { [s.danger]: hfState === 'danger' }
          )}
        >
          2.3
        </div>
      </div>
    </div>
  )
}

type FormProps = { tokenAmount: BigNumber; fiatAmount: BigNumber }

const FormERC20: React.FC<{ tokenSymbol: string; tokenAddress: string }> = ({
  tokenAddress,
  tokenSymbol,
}) => {
  const [form] = AntdForm.useForm<FormProps>()
  const { address: currentUserAddress, isAppConnected, web3Provider } = useWeb3Connection()
  const { isProxyAvailable, loadingProxy, setupProxy, userProxy, userProxyAddress } = useUserProxy()
  const { allowance, approve, hasAllowance, loadingApprove } = useERC20Allowance(
    tokenAddress,
    userProxyAddress ?? '',
  )

  const userActions = useUserActions()
  const [balance, refetchErc20Balance] = useContractCall<
    ERC20,
    'balanceOf',
    [string],
    Promise<ethers.BigNumber>
  >(tokenAddress, contracts.ERC_20.abi, 'balanceOf', [currentUserAddress || DEFAULT_ADDRESS])

  // Setup Proxy :tick
  // Allowance loading:tick
  // Deposit :loading
  const humanReadableValue = useMemo(
    () => (balance ? getHumanValue(BigNumber.from(balance.toString()), 6) : 0),
    [balance],
  )

  const [stateMachine, send] = useMachine(stepperMachine, {
    context: {
      isProxyAvailable,
      hasAllowance,
      tokenAddress,
      tokenSymbol,
    },
  })

  // hasAllowance comes in false on init.
  // This useEffect change hasAllowance value on Machine
  useEffect(() => {
    if (hasAllowance) send({ type: 'SET_HAS_ALLOWANCE', hasAllowance })
  }, [hasAllowance, send])

  const [tab, setTab] = useState('bond')
  const [mintFiat, setMintFiat] = useState(false)

  const toggleMintFiat = () => setMintFiat(!mintFiat)

  return (
    <>
      {stateMachine.context.currentStepNumber !== 7 ? (
        <>
          <StepperTitle
            currentStep={stateMachine.context.currentStepNumber}
            description={TITLES_BY_STEP[stateMachine.context.currentStepNumber].subtitle}
            title={TITLES_BY_STEP[stateMachine.context.currentStepNumber].title}
            totalSteps={stateMachine.context.totalStepNumber}
          />
          <div className={cn(s.form)}>
            {stateMachine.context.currentStepNumber === 1 && (
              <RadioTabsWrapper className={cn(s.radioTabsWrapper)}>
                <RadioTab checked={tab === 'bond'} onClick={() => setTab('bond')}>
                  Bond
                </RadioTab>
                <RadioTab checked={tab === 'underlying'} onClick={() => setTab('underlying')}>
                  Underlying
                </RadioTab>
              </RadioTabsWrapper>
            )}
            {[1, 4].includes(stateMachine.context.currentStepNumber) && (
              <div className={cn(s.balanceWrapper)}>
                <h3 className={cn(s.balanceLabel)}>Deposit {stateMachine.context.tokenSymbol}</h3>
                <p className={cn(s.balance)}>Available: {humanReadableValue?.toFixed()}</p>
              </div>
            )}
            <Form form={form} initialValues={{ tokenAmount: 0, fiatAmount: 0 }}>
              {[1, 4].includes(stateMachine.context.currentStepNumber) && (
                <Form.Item name="tokenAmount" required>
                  <TokenAmount
                    displayDecimals={4}
                    max={humanReadableValue}
                    maximumFractionDigits={6}
                    onChange={(val) => val && send({ type: 'SET_ERC20_AMOUNT', erc20Amount: val })}
                    slider
                    tokenIcon={<ElementIcon />}
                  />
                </Form.Item>
              )}
              {stateMachine.context.currentStepNumber === 1 && (
                <div className={s.buttonsWrapper}>
                  {!isProxyAvailable && (
                    <ButtonGradient
                      disabled={!stateMachine.context.erc20Amount.gt(0)}
                      height="lg"
                      onClick={() => send({ type: 'CLICK_SETUP_PROXY' })}
                    >
                      Setup Proxy
                    </ButtonGradient>
                  )}
                  {!hasAllowance && (
                    <ButtonGradient
                      disabled={!stateMachine.context.erc20Amount.gt(0) || !isProxyAvailable}
                      height="lg"
                      onClick={() => send({ type: 'CLICK_ALLOW' })}
                    >
                      Set Allowance
                    </ButtonGradient>
                  )}
                </div>
              )}
              {stateMachine.context.currentStepNumber === 2 && (
                <div className={s.buttonsWrapper}>
                  <ButtonGradient height="lg" loading={loadingProxy} onClick={setupProxy}>
                    Create Proxy
                  </ButtonGradient>
                  <button className={s.backButton} onClick={() => console.log('go back')}>
                    &#8592; Go back
                  </button>
                </div>
              )}
              {stateMachine.context.currentStepNumber === 3 && (
                <ButtonGradient height="lg" loading={loadingApprove} onClick={approve}>
                  Set Allowance for TOKEN_NAME
                </ButtonGradient>
              )}
              {stateMachine.context.currentStepNumber === 4 && (
                <>
                  {mintFiat && (
                    <div className={cn(s.fiatWrapper)}>
                      <button className={cn(s.fiatWrapperTop)} onClick={() => toggleMintFiat()}>
                        <span className={cn(s.fiatWrapperTopInner)}>
                          <Less />
                          <span>Mint FIAT with this transaction</span>
                        </span>
                      </button>
                      <div className={cn(s.fiatWrapperContents)}>
                        <div className={cn(s.fiatWrapperContentsInner)}>
                          <div className={cn(s.balanceWrapper)}>
                            <h3 className={cn(s.balanceLabel)}>Mint FIAT</h3>
                            <p className={cn(s.balance)}>Available: 4,800</p>
                          </div>
                          <Form.Item name="fiatAmount" required style={{ marginBottom: 0 }}>
                            <TokenAmount
                              disabled={false}
                              displayDecimals={4}
                              max={stateMachine.context.erc20Amount.toNumber()}
                              maximumFractionDigits={6}
                              onChange={(val) =>
                                val && send({ type: 'SET_FIAT_AMOUNT', fiatAmount: val })
                              }
                              slider="healthFactorVariant"
                              tokenIcon={<FiatIcon />}
                            />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className={s.buttonsWrapper}>
                    {!mintFiat && (
                      <ButtonOutlineGradient onClick={() => toggleMintFiat()} textGradient>
                        <Plus />
                        Mint FIAT with this transaction
                      </ButtonOutlineGradient>
                    )}
                    <ButtonGradient height="lg" onClick={() => send({ type: 'CLICK_DEPLOY' })}>
                      Deposit collateral
                    </ButtonGradient>
                  </div>
                </>
              )}
              {stateMachine.context.currentStepNumber === 5 && (
                <>
                  <Summary />
                  <div className={s.buttonsWrapper}>
                    <ButtonGradient
                      disabled={!hasAllowance || !isProxyAvailable}
                      height="lg"
                      onClick={() =>
                        send({
                          type: 'CONFIRM',
                          // @ts-ignore TODO types
                          currentUserAddress,
                          isAppConnected,
                          web3Provider,
                          userActions,
                          userProxy,
                          refetchErc20Balance,
                          allowance,
                        })
                      }
                    >
                      Confirm
                    </ButtonGradient>
                    <button className={s.backButton} onClick={() => console.log('go back')}>
                      &#8592; Go back
                    </button>
                  </div>
                </>
              )}
            </Form>
          </div>
        </>
      ) : (
        <div className={cn(s.form)}>
          {/* Note: this will be replaced with the actual animation */}
          <div className={cn(s.lastStepAnimation)}>
            <Success />
          </div>
          <h1 className={cn(s.lastStepTitle)}>Congrats!</h1>
          <p className={cn(s.lastStepText)}>Your position has been successfully created.</p>
          <Summary />
          <ButtonGradient height="lg">Go to bb_sBond_cDAI position</ButtonGradient>
        </div>
      )}
    </>
  )
}

const OpenPosition = () => {
  const {
    query: { collateralId: tokenAddress },
  } = useRouter()
  const { tokenSymbol } = useTokenSymbol(tokenAddress as string)

  const mockedBlocks = [
    {
      title: 'Bond Name',
      url: 'https://google.com',
      value: 'eursCRV',
    },
    {
      title: 'Underlying',
      url: 'https://google.com',
      value: 'DAI',
    },
    {
      title: 'Bond Maturity',
      tooltip: 'Tooltip text',
      value: '16 May, 2021',
    },
    {
      title: 'Bond Face Value',
      tooltip: 'Tooltip text',
      value: '$100.00',
    },
    {
      title: 'Bond Current Value',
      tooltip: 'Tooltip text',
      value: '$150.00',
    },
    {
      title: 'Collateralization Ratio',
      tooltip: 'Tooltip text',
      value: '43%',
    },
    {
      title: 'Stability fee',
      tooltip: 'Tooltip text',
      value: '0',
    },
  ]

  return (
    <>
      <BackButton href="/open-position">Back</BackButton>
      <PositionFormsLayout
        form={<FormERC20 tokenAddress={tokenAddress as string} tokenSymbol={tokenSymbol} />}
        infoBlocks={mockedBlocks.map((item, index) => (
          <InfoBlock
            key={`${index}_info`}
            title={item.title}
            tooltip={item.tooltip || ''}
            url={item.url || ''}
            value={item.value}
          />
        ))}
      />
    </>
  )
}

export default genericSuspense(OpenPosition)
