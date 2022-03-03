import s from './s.module.scss'
import { useMachine } from '@xstate/react'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import { useEffect, useState } from 'react'
import Lottie from 'lottie-react'
import { getCurrentValue } from '@/src/utils/getCurrentValue'
import { useFIATBalance } from '@/src/hooks/useFIATBalance'
import withRequiredConnection from '@/src/hooks/RequiredConnection'
import { Form } from '@/src/components/antd'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { RadioTab, RadioTabsWrapper } from '@/src/components/antd/radio-tab'
import { ButtonBack } from '@/src/components/custom/button-back'
import { Balance } from '@/src/components/custom/balance'
import { ButtonExtraFormAction } from '@/src/components/custom/button-extra-form-action'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { FormExtraAction } from '@/src/components/custom/form-extra-action'
import { PositionFormsLayout } from '@/src/components/custom/position-forms-layout'
import { Summary } from '@/src/components/custom/summary'
import TokenAmount from '@/src/components/custom/token-amount'
import { WAD_DECIMALS } from '@/src/constants/misc'
import { useTokenSymbol } from '@/src/hooks/contracts/useTokenSymbol'
import { useDynamicTitle } from '@/src/hooks/useDynamicTitle'
import { useERC20Allowance } from '@/src/hooks/useERC20Allowance'
import { useUserActions } from '@/src/hooks/useUserActions'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import stepperMachine, { TITLES_BY_STEP } from '@/src/state/open-position-form'
import { useQueryParam } from '@/src/hooks/useQueryParam'
import { useCollateral } from '@/src/hooks/subgraph/useCollateral'
import { Collateral } from '@/src/utils/data/collaterals'
import { parseDate } from '@/src/utils/dateTime'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { getHumanValue, getNonHumanValue } from '@/src/web3/utils'
import { useTokenDecimalsAndBalance } from '@/src/hooks/useTokenDecimalsAndBalance'
import SuccessAnimation from '@/src/resources/animations/success-animation.json'

const DEFAULT_HEALTH_FACTOR = ''

const StepperTitle: React.FC<{
  currentStep: number
  description: string
  title: string
  totalSteps: number
}> = ({ currentStep, description, title, totalSteps }) => (
  <div className={cn(s.stepperWrapper)}>
    <div className={cn(s.stepperTitleWrapper)}>
      <h2 className={cn(s.stepperTitle)}>{title}</h2>
      <div className={cn(s.steps)}>
        <span className={cn(s.currentStep)}>{currentStep}</span>/{totalSteps}
      </div>
    </div>
    <p className={cn(s.stepperDescription)}>{description}</p>
  </div>
)

type FormProps = { tokenAmount: BigNumber; fiatAmount: BigNumber }

const FormERC20: React.FC<{
  tokenSymbol: string
  tokenAddress: string
  collateral: Collateral
}> = ({ collateral, tokenAddress, tokenSymbol }) => {
  const [form] = AntdForm.useForm<FormProps>()
  const { address: currentUserAddress, appChainId, readOnlyAppProvider } = useWeb3Connection()
  const { isProxyAvailable, loadingProxy, setupProxy, userProxyAddress } = useUserProxy()
  const { approve, hasAllowance, loadingApprove } = useERC20Allowance(
    tokenAddress,
    userProxyAddress ?? '',
  )
  const { tokenInfo } = useTokenDecimalsAndBalance({
    tokenAddress,
    address: currentUserAddress,
    readOnlyAppProvider,
  })

  const [currentValue, setCurrentValue] = useState(ZERO_BIG_NUMBER)

  const [FIATBalance] = useFIATBalance(true)

  const { depositCollateral } = useUserActions()
  const [stateMachine, send] = useMachine(stepperMachine, {
    context: {
      isProxyAvailable,
      hasAllowance,
      tokenAddress,
      tokenSymbol,
      loading: true,
    },
  })

  const createPosition = async ({
    erc20Amount,
    fiatAmount,
  }: {
    erc20Amount: BigNumber
    fiatAmount: BigNumber
  }): Promise<void> => {
    const _erc20Amount = erc20Amount ? getNonHumanValue(erc20Amount, 18) : ZERO_BIG_NUMBER
    const _fiatAmount = fiatAmount ? getNonHumanValue(fiatAmount, 18) : ZERO_BIG_NUMBER

    return depositCollateral({
      vault: collateral.vault.address,
      token: tokenAddress,
      tokenId: 0,
      toDeposit: _erc20Amount,
      toMint: _fiatAmount,
    })
  }

  // hasAllowance comes in false on init.
  // This useEffect change hasAllowance value on Machine
  useEffect(() => {
    send({ type: 'SET_HAS_ALLOWANCE', hasAllowance })
    send({ type: 'SET_PROXY_AVAILABLE', isProxyAvailable })
    send({ type: 'SET_LOADING', loading: false })
  }, [hasAllowance, isProxyAvailable, send])

  useEffect(() => {
    getCurrentValue(readOnlyAppProvider, appChainId, 0, collateral.vault.address, false).then(
      (cv) => setCurrentValue(cv),
    )
  }, [appChainId, collateral.vault.address, readOnlyAppProvider, setCurrentValue, tokenAddress])

  const [tab, setTab] = useState('bond')
  const [mintFiat, setMintFiat] = useState(false)

  const toggleMintFiat = () => setMintFiat(!mintFiat)

  const healthFactor = currentValue
    .times(stateMachine.context.erc20Amount)
    .div(stateMachine.context.fiatAmount)
    .unscaleBy(18)
    .toFixed(2)

  const mockedSummaryData = [
    {
      title: 'In your wallet',
      value: `${tokenInfo?.humanValue} ${collateral.symbol}`,
    },
    {
      title: 'Depositing into position ',
      value: `${stateMachine.context.erc20Amount.toFixed(4)} ${collateral.symbol}`,
    },
    {
      title: 'Remaining in wallet',
      value: `${tokenInfo?.humanValue?.minus(stateMachine.context.erc20Amount).toFixed(4)} ${
        collateral.symbol
      }`,
    },
    {
      title: 'FIAT to be minted',
      value: `${stateMachine.context.fiatAmount.toFixed(4)}`,
    },
    {
      state: 'ok',
      title: 'Updated health factor',
      value: healthFactor,
    },
  ]

  return (
    <>
      {stateMachine.context.currentStepNumber !== 4 ? (
        // {stateMachine.context.currentStepNumber !== 7 ? (
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
              <Balance
                title={`Deposit ${stateMachine.context.tokenSymbol}`}
                value={`Available:
              ${tokenInfo?.humanValue?.toFixed()}`}
              />
            )}
            <Form form={form} initialValues={{ tokenAmount: 0, fiatAmount: 0 }}>
              {[1, 4].includes(stateMachine.context.currentStepNumber) && (
                <Form.Item name="tokenAmount" required>
                  <TokenAmount
                    displayDecimals={tokenInfo?.decimals}
                    mainAsset={collateral.vaultName as string}
                    max={tokenInfo?.humanValue}
                    maximumFractionDigits={tokenInfo?.decimals}
                    onChange={(val) => val && send({ type: 'SET_ERC20_AMOUNT', erc20Amount: val })}
                    secondaryAsset={tokenSymbol}
                    slider
                  />
                </Form.Item>
              )}
              {stateMachine.context.currentStepNumber === 1 && (
                <ButtonsWrapper>
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
                </ButtonsWrapper>
              )}
              {stateMachine.context.currentStepNumber === 2 && (
                <ButtonsWrapper>
                  <ButtonGradient height="lg" loading={loadingProxy} onClick={setupProxy}>
                    Create Proxy
                  </ButtonGradient>
                  <button className={s.backButton} onClick={() => console.log('go back')}>
                    &#8592; Go back
                  </button>
                </ButtonsWrapper>
              )}
              {stateMachine.context.currentStepNumber === 3 && (
                <ButtonGradient height="lg" loading={loadingApprove} onClick={approve}>
                  {`Set Allowance for ${tokenSymbol}`}
                </ButtonGradient>
              )}
              {stateMachine.context.currentStepNumber === 4 && (
                <>
                  {mintFiat && (
                    <FormExtraAction
                      bottom={
                        <Form.Item name="fiatAmount" required style={{ marginBottom: 0 }}>
                          <TokenAmount
                            disabled={false}
                            displayDecimals={4}
                            healthFactorValue={
                              !isFinite(Number(healthFactor)) ? DEFAULT_HEALTH_FACTOR : healthFactor
                            }
                            max={
                              stateMachine.context.erc20Amount.toNumber() /
                              (collateral?.collateralizationRatio || 1)
                            }
                            maximumFractionDigits={6}
                            onChange={(val) =>
                              val && send({ type: 'SET_FIAT_AMOUNT', fiatAmount: val })
                            }
                            slider="healthFactorVariant"
                            tokenIcon={<FiatIcon />}
                          />
                        </Form.Item>
                      }
                      buttonText="Mint FIAT with this transaction"
                      onClick={toggleMintFiat}
                      top={
                        <Balance
                          title={`Mint FIAT`}
                          value={`Available: ${FIATBalance.toFixed(4)}`}
                        />
                      }
                    />
                  )}
                  <ButtonsWrapper>
                    {!mintFiat && (
                      <ButtonExtraFormAction onClick={() => toggleMintFiat()}>
                        Mint FIAT with this transaction
                      </ButtonExtraFormAction>
                    )}
                    <ButtonGradient height="lg" onClick={() => send({ type: 'CLICK_DEPLOY' })}>
                      Deposit collateral
                    </ButtonGradient>
                  </ButtonsWrapper>
                </>
              )}
              {stateMachine.context.currentStepNumber === 5 && (
                <>
                  <Summary data={mockedSummaryData} />
                  <ButtonsWrapper>
                    <ButtonGradient
                      disabled={!hasAllowance || !isProxyAvailable}
                      height="lg"
                      onClick={() =>
                        send({
                          type: 'CONFIRM',
                          // @ts-ignore TODO types
                          createPosition,
                        })
                      }
                    >
                      Confirm
                    </ButtonGradient>
                    <button className={cn(s.backButton)} onClick={() => send({ type: 'GO_BACK' })}>
                      &#8592; Go back
                    </button>
                  </ButtonsWrapper>
                </>
              )}
            </Form>
          </div>
        </>
      ) : (
        <div className={cn(s.form)}>
          <div className={cn(s.lastStepAnimation)}>
            <Lottie animationData={SuccessAnimation} autoplay loop />
          </div>
          <h1 className={cn(s.lastStepTitle)}>Congrats!</h1>
          <p className={cn(s.lastStepText)}>Your position has been successfully created.</p>
          <Summary data={mockedSummaryData} />
          <ButtonGradient height="lg">Go to bb_sBond_cDAI position</ButtonGradient>
        </div>
      )}
    </>
  )
}

const OpenPosition = () => {
  const tokenAddress = useQueryParam('collateralId')
  const { tokenSymbol } = useTokenSymbol(tokenAddress)
  useDynamicTitle(tokenSymbol && `Create ${tokenSymbol} position`)
  const { data: collateral } = useCollateral(tokenAddress)

  const mockedBlocks = [
    {
      title: 'Bond Name',
      value: collateral ? collateral.symbol : '-',
    },
    {
      title: 'Underlying',
      value: collateral ? collateral.underlierSymbol : '-',
    },
    {
      title: 'Bond Maturity',
      tooltip: 'Tooltip text',
      value: collateral?.maturity ? parseDate(collateral?.maturity) : '-',
    },
    {
      title: 'Bond Face Value',
      tooltip: 'Tooltip text',
      value: `$${getHumanValue(collateral?.faceValue ?? 0, WAD_DECIMALS)?.toFixed(3)}`,
    },
    {
      title: 'Bond Collateral Value',
      tooltip: 'Tooltip text',
      value: `$${getHumanValue(collateral?.currentValue ?? 0, WAD_DECIMALS)?.toFixed(3)}`,
    },
    {
      title: 'Collateralization Ratio',
      tooltip: 'Tooltip text',
      value: collateral ? `${collateral.collateralizationRatio} %` : '-',
    },
    {
      title: 'Stability fee',
      tooltip: 'Tooltip text',
      value: '0',
    },
  ]

  return (
    <>
      <ButtonBack href="/create-position">Back</ButtonBack>
      <PositionFormsLayout
        form={
          <FormERC20
            collateral={collateral as Collateral} // TODO Fix with suspense
            tokenAddress={tokenAddress as string}
            tokenSymbol={tokenSymbol}
          />
        }
        infoBlocks={mockedBlocks}
      />
    </>
  )
}

export default withRequiredConnection(OpenPosition)
