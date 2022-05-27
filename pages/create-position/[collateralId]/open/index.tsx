import s from './s.module.scss'
import { useERC155Allowance } from '../../../../src/hooks/useERC1155Allowance'
import { Form } from '@/src/components/antd'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { Balance } from '@/src/components/custom/balance'
import { ButtonBack } from '@/src/components/custom/button-back'
import { ButtonExtraFormAction } from '@/src/components/custom/button-extra-form-action'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { FormExtraAction } from '@/src/components/custom/form-extra-action'
import { PositionFormsLayout } from '@/src/components/custom/position-forms-layout'
import SafeSuspense from '@/src/components/custom/safe-suspense'
import { Summary } from '@/src/components/custom/summary'
import TokenAmount from '@/src/components/custom/token-amount'
import {
  DEPOSIT_COLLATERAL_TEXT,
  EST_FIAT_TO_MINT_TEXT,
  FIAT_TO_MINT_TOOLTIP_TEXT,
  ONE_BIG_NUMBER,
  VIRTUAL_RATE_MAX_SLIPPAGE,
  WAD_DECIMALS,
  ZERO_BIG_NUMBER,
  getBorrowAmountBelowDebtFloorText,
} from '@/src/constants/misc'
import withRequiredConnection from '@/src/hooks/RequiredConnection'
import { useCollateral } from '@/src/hooks/subgraph/useCollateral'
import { useDynamicTitle } from '@/src/hooks/useDynamicTitle'
import { useERC20Allowance } from '@/src/hooks/useERC20Allowance'
import { useFIATBalance } from '@/src/hooks/useFIATBalance'
import { useQueryParam } from '@/src/hooks/useQueryParam'
import { useTokenDecimalsAndBalance } from '@/src/hooks/useTokenDecimalsAndBalance'
import { useUserActions } from '@/src/hooks/useUserActions'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import SuccessAnimation from '@/src/resources/animations/success-animation.json'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import stepperMachine, { TITLES_BY_STEP } from '@/src/state/open-position-form'
import { Collateral } from '@/src/utils/data/collaterals'
import { calculateHealthFactor } from '@/src/utils/data/positions'
import { parseDate } from '@/src/utils/dateTime'
import { getHealthFactorState } from '@/src/utils/table'
import {
  getEtherscanAddressUrl,
  getHumanValue,
  getNonHumanValue,
  perSecondToAPR,
} from '@/src/web3/utils'
import { useMachine } from '@xstate/react'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import Lottie from 'lottie-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

// @TODO: hardcoded step from open-position-form
const LAST_STEP = 7

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
  tokenAsset: string
  tokenAddress: string
  collateral: Collateral
}> = ({ collateral, tokenAddress, tokenSymbol }) => {
  const [form] = AntdForm.useForm<FormProps>()
  const { address: currentUserAddress, readOnlyAppProvider } = useWeb3Connection()
  const { isProxyAvailable, loadingProxy, setupProxy, userProxyAddress } = useUserProxy()
  const [loading, setLoading] = useState(false)

  const erc20 = useERC20Allowance(tokenAddress, userProxyAddress ?? '')
  const erc1155 = useERC155Allowance(tokenAddress, userProxyAddress ?? '')

  const activeToken = collateral.vault.type === 'NOTIONAL' ? erc1155 : erc20
  const { approve, hasAllowance, loadingApprove } = activeToken

  const { tokenInfo } = useTokenDecimalsAndBalance({
    tokenData: {
      symbol: collateral.symbol ?? '',
      address: collateral.address ?? '',
      decimals: 8, // TODO: Fix me
    },
    vaultType: collateral.vault.type ?? '',
    tokenId: collateral.tokenId ?? '0',
    address: currentUserAddress,
    readOnlyAppProvider,
  })

  const [FIATBalance] = useFIATBalance(true)

  const { depositCollateral } = useUserActions(collateral.vault?.type)
  const [stateMachine, send] = useMachine(stepperMachine, {
    context: {
      isProxyAvailable,
      hasAllowance,
      tokenAddress,
      tokenSymbol,
    },
  })

  const createPosition = async ({
    erc20Amount,
    fiatAmount,
  }: {
    erc20Amount: BigNumber
    fiatAmount: BigNumber
  }): Promise<void> => {
    const _erc20Amount = erc20Amount ? getNonHumanValue(erc20Amount, WAD_DECIMALS) : ZERO_BIG_NUMBER
    const _fiatAmount = fiatAmount ? getNonHumanValue(fiatAmount, WAD_DECIMALS) : ZERO_BIG_NUMBER
    try {
      setLoading(true)

      await depositCollateral({
        vault: collateral.vault.address,
        virtualRate: collateral.vault.virtualRate,
        token: tokenAddress,
        tokenId: Number(collateral.tokenId) ?? 0,
        toDeposit: _erc20Amount,
        toMint: _fiatAmount,
      })
      setLoading(false)
    } catch (err) {
      setLoading(false)
      throw err
    }
  }

  // hasAllowance comes in false on init.
  // This useEffect change hasAllowance value on Machine
  useEffect(() => {
    send({ type: 'SET_HAS_ALLOWANCE', hasAllowance })
    send({ type: 'SET_PROXY_AVAILABLE', isProxyAvailable })
  }, [hasAllowance, isProxyAvailable, send])

  const [tab] = useState('bond')
  const [mintFiat, setMintFiat] = useState(false)

  const toggleMintFiat = () => setMintFiat(!mintFiat)

  const maxBorrowAmountCalculated = useMemo(() => {
    const totalCollateral = stateMachine.context.erc20Amount ?? ZERO_BIG_NUMBER
    const collateralValue = getHumanValue(collateral.currentValue || ONE_BIG_NUMBER, WAD_DECIMALS)
    const collateralizationRatio = getHumanValue(
      collateral.vault.collateralizationRatio || ONE_BIG_NUMBER,
      WAD_DECIMALS,
    )

    const virtualRateWithMargin = VIRTUAL_RATE_MAX_SLIPPAGE.times(collateral.vault.virtualRate)

    const maxBorrowAmount = totalCollateral
      .times(collateralValue)
      .div(collateralizationRatio)
      .div(virtualRateWithMargin)

    return maxBorrowAmount
  }, [stateMachine.context.erc20Amount, collateral])

  const hasMinimumFIAT = useMemo(() => {
    const fiatAmount = stateMachine.context.fiatAmount ?? ZERO_BIG_NUMBER
    const debtFloor = collateral.vault.debtFloor
    const nonHumanFiatAmount = getNonHumanValue(fiatAmount, WAD_DECIMALS) ?? ZERO_BIG_NUMBER

    return nonHumanFiatAmount.gte(debtFloor) || nonHumanFiatAmount.isZero()
  }, [stateMachine.context.fiatAmount, collateral.vault.debtFloor])

  const isDisabledCreatePosition = () => {
    return !hasAllowance || !isProxyAvailable || loading || !hasMinimumFIAT
  }

  const deltaCollateral = getNonHumanValue(stateMachine.context.erc20Amount, WAD_DECIMALS)
  const deltaDebt = getNonHumanValue(stateMachine.context.fiatAmount, WAD_DECIMALS)
  const { healthFactor: hf } = calculateHealthFactor(
    collateral.currentValue,
    collateral.vault.collateralizationRatio,
    deltaCollateral,
    deltaDebt,
  )
  const healthFactorNumber = hf?.toFixed(3)

  const summaryData = [
    {
      title: 'In your wallet',
      value: `${tokenInfo?.humanValue?.toFixed(3)} ${tokenSymbol}`,
    },
    {
      title: 'Depositing into position',
      value: `${stateMachine.context.erc20Amount.toFixed(3)} ${tokenSymbol}`,
    },
    {
      title: 'Remaining in wallet',
      value: `${tokenInfo?.humanValue
        ?.minus(stateMachine.context.erc20Amount)
        .toFixed(4)} ${tokenSymbol}`,
    },
    {
      // debt
      title: 'Estimated FIAT debt',
      value: `${stateMachine.context.fiatAmount.toFixed(3)}`,
    },
    {
      title: EST_FIAT_TO_MINT_TEXT,
      titleTooltip: FIAT_TO_MINT_TOOLTIP_TEXT,
      value: `${stateMachine.context.fiatAmount
        .div(collateral.vault.virtualRate.times(VIRTUAL_RATE_MAX_SLIPPAGE))
        .toFixed(3)}`,
    },
    {
      state: getHealthFactorState(hf),
      title: 'Updated health factor',
      value: healthFactorNumber,
    },
  ]

  return (
    <>
      {stateMachine.context.currentStepNumber !== LAST_STEP ? (
        <>
          <StepperTitle
            currentStep={stateMachine.context.currentStepNumber}
            description={TITLES_BY_STEP[stateMachine.context.currentStepNumber].subtitle}
            title={TITLES_BY_STEP[stateMachine.context.currentStepNumber].title}
            totalSteps={stateMachine.context.totalStepNumber}
          />
          <div className={cn(s.form)}>
            {tab === 'bond' && (
              <Form form={form} initialValues={{ tokenAmount: 0, fiatAmount: 0 }}>
                {[1, 4].includes(stateMachine.context.currentStepNumber) && (
                  <>
                    <Balance
                      title={`Deposit ${stateMachine.context.tokenSymbol}`}
                      value={`Balance: ${tokenInfo?.humanValue?.toFixed()}`}
                    />
                    <Form.Item name="tokenAmount" required>
                      <TokenAmount
                        disabled={loading}
                        displayDecimals={tokenInfo?.decimals}
                        mainAsset={collateral.vault.name}
                        max={tokenInfo?.humanValue}
                        maximumFractionDigits={tokenInfo?.decimals}
                        onChange={(val) =>
                          val && send({ type: 'SET_ERC20_AMOUNT', erc20Amount: val })
                        }
                        slider
                      />
                    </Form.Item>
                    {mintFiat && (
                      <FormExtraAction
                        bottom={
                          <Form.Item name="fiatAmount" required style={{ marginBottom: 0 }}>
                            <TokenAmount
                              disabled={loading}
                              displayDecimals={4}
                              healthFactorValue={healthFactorNumber}
                              max={maxBorrowAmountCalculated}
                              maximumFractionDigits={6}
                              onChange={(val) =>
                                val && send({ type: 'SET_FIAT_AMOUNT', fiatAmount: val })
                              }
                              slider="healthFactorVariant"
                              tokenIcon={<FiatIcon />}
                            />
                          </Form.Item>
                        }
                        buttonText="Borrow FIAT with this transaction"
                        disabled={loading}
                        onClick={toggleMintFiat}
                        top={
                          <Balance
                            title={`Borrow FIAT`}
                            value={`Balance: ${FIATBalance.toFixed(4)}`}
                          />
                        }
                      />
                    )}
                  </>
                )}
                <ButtonsWrapper>
                  {stateMachine.context.currentStepNumber === 1 && (
                    <>
                      {!mintFiat && (
                        <ButtonExtraFormAction onClick={() => toggleMintFiat()}>
                          Borrow FIAT with this transaction
                        </ButtonExtraFormAction>
                      )}
                      {!isProxyAvailable && (
                        <ButtonGradient
                          height="lg"
                          onClick={() => send({ type: 'CLICK_SETUP_PROXY' })}
                        >
                          Setup Proxy
                        </ButtonGradient>
                      )}
                      {isProxyAvailable && !hasAllowance && (
                        <ButtonGradient
                          disabled={!stateMachine.context.erc20Amount.gt(0) || !isProxyAvailable}
                          height="lg"
                          onClick={() => send({ type: 'CLICK_ALLOW' })}
                        >
                          {stateMachine.context.erc20Amount.gt(0)
                            ? 'Set Allowance'
                            : `Insufficient Balance for ${tokenSymbol}`}
                        </ButtonGradient>
                      )}
                    </>
                  )}
                  {stateMachine.context.currentStepNumber === 2 && (
                    <>
                      <ButtonGradient height="lg" loading={loadingProxy} onClick={setupProxy}>
                        Create Proxy
                      </ButtonGradient>
                      <button
                        className={cn(s.backButton)}
                        onClick={() => send({ type: 'GO_BACK' })}
                      >
                        &#8592; Go back
                      </button>
                    </>
                  )}
                  {stateMachine.context.currentStepNumber === 3 && (
                    <>
                      <ButtonGradient height="lg" loading={loadingApprove} onClick={approve}>
                        {`Set Allowance`}
                      </ButtonGradient>
                      <button
                        className={cn(s.backButton)}
                        onClick={() => send({ type: 'GO_BACK' })}
                      >
                        &#8592; Go back
                      </button>
                    </>
                  )}
                  {stateMachine.context.currentStepNumber === 4 && (
                    <>
                      {!mintFiat && (
                        <ButtonExtraFormAction onClick={() => toggleMintFiat()}>
                          Borrow FIAT with this transaction
                        </ButtonExtraFormAction>
                      )}
                      <ButtonGradient
                        disabled={isDisabledCreatePosition()}
                        height="lg"
                        onClick={() =>
                          send({
                            type: 'CONFIRM',
                            // @ts-ignore TODO types
                            createPosition,
                          })
                        }
                      >
                        {hasMinimumFIAT
                          ? DEPOSIT_COLLATERAL_TEXT
                          : getBorrowAmountBelowDebtFloorText(collateral.vault.debtFloor)}
                      </ButtonGradient>
                    </>
                  )}
                </ButtonsWrapper>
                {stateMachine.context.currentStepNumber === 4 && (
                  <div className={cn(s.summary)}>
                    <Summary data={summaryData} />
                  </div>
                )}
              </Form>
            )}
          </div>
        </>
      ) : (
        <div className={cn(s.form)}>
          <div className={cn(s.lastStepAnimation)}>
            <Lottie animationData={SuccessAnimation} autoplay loop />
          </div>
          <h1 className={cn(s.lastStepTitle)}>Congrats!</h1>
          <p className={cn(s.lastStepText)}>
            Your position has been successfully created! It may take a couple seconds for your
            position to show in the app.
          </p>
          <Summary data={summaryData} />
          <Link href={`/your-positions/`} passHref>
            <ButtonGradient height="lg">Go to Your Positions</ButtonGradient>
          </Link>
        </div>
      )}
    </>
  )
}

const OpenPosition = () => {
  const collateralId = useQueryParam('collateralId')
  useDynamicTitle(`Create Position`)
  const { data: collateral } = useCollateral(collateralId)

  const tokenSymbol = collateral?.symbol ?? ''
  const tokenAsset = collateral?.asset ?? ''
  const collateralizationRatio = collateral?.vault.collateralizationRatio ?? null
  const interestPerSecond = collateral?.vault.interestPerSecond ?? ZERO_BIG_NUMBER
  const chainId = useWeb3Connection().appChainId

  const infoBlocks = [
    {
      title: 'Token',
      value: tokenAsset ?? '-',
      url: getEtherscanAddressUrl(collateral?.address as string, chainId),
    },
    {
      title: 'Underlying Asset',
      value: collateral ? collateral.underlierSymbol : '-',
      url: collateral?.underlierAddress
        ? getEtherscanAddressUrl(collateral?.underlierAddress, chainId)
        : '',
    },
    {
      title: 'Maturity Date',
      tooltip: 'The date on which the bond is redeemable for its underlying assets.',
      value: collateral?.maturity ? parseDate(collateral?.maturity) : '--:--:--',
    },
    {
      title: 'Face Value',
      tooltip: 'The redeemable value of the bond at maturity.',
      value: `$${getHumanValue(collateral?.faceValue ?? 0, WAD_DECIMALS)?.toFixed(2)}`,
    },
    {
      title: 'Price',
      tooltip: 'The currently discounted value of the bond.',
      value: `$${getHumanValue(collateral?.currentValue ?? 0, WAD_DECIMALS)?.toFixed(2)}`,
    },
    {
      title: 'Collateralization Threshold',
      tooltip: 'The minimum amount of over-collateralization required to borrow FIAT.',
      value: collateralizationRatio
        ? `${getHumanValue(collateralizationRatio.times(100), WAD_DECIMALS)}%`
        : '-',
    },
    {
      title: 'Interest Rate',
      tooltip: 'The annualized cost of interest for minting FIAT.',
      value: `${perSecondToAPR(getHumanValue(interestPerSecond, WAD_DECIMALS)).toFixed(3)}%`,
    },
  ]

  return (
    <>
      <ButtonBack href="/create-position">Back</ButtonBack>
      <PositionFormsLayout infoBlocks={infoBlocks}>
        <SafeSuspense>
          <FormERC20
            collateral={collateral as Collateral}
            tokenAddress={collateral?.address as string}
            tokenAsset={tokenAsset}
            tokenSymbol={tokenSymbol}
          />
        </SafeSuspense>
      </PositionFormsLayout>
    </>
  )
}

export default withRequiredConnection(OpenPosition)
