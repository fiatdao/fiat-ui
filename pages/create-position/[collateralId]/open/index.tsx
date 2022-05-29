import s from './s.module.scss'
import { useERC155Allowance } from '../../../../src/hooks/useERC1155Allowance'
import { useMachine } from '@xstate/react'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import Lottie from 'lottie-react'
import { RadioTab, RadioTabsWrapper } from '@/src/components/antd/radio-tab'
import SafeSuspense from '@/src/components/custom/safe-suspense'
import { getHealthFactorState } from '@/src/utils/table'
import { getEtherscanAddressUrl } from '@/src/web3/utils'
import { useFIATBalance } from '@/src/hooks/useFIATBalance'
import withRequiredConnection from '@/src/hooks/RequiredConnection'
import { Form } from '@/src/components/antd'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { ButtonBack } from '@/src/components/custom/button-back'
import { Balance } from '@/src/components/custom/balance'
import { ButtonExtraFormAction } from '@/src/components/custom/button-extra-form-action'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { FormExtraAction } from '@/src/components/custom/form-extra-action'
import { PositionFormsLayout } from '@/src/components/custom/position-forms-layout'
import { Summary, SummaryItem } from '@/src/components/custom/summary'
import TokenAmount from '@/src/components/custom/token-amount'
// import InternalArrow from '../../../../src/resources/svg/interal-arrow.svg'
// import SwapSettingsModal from '@/src/components/custom/swap-settings-modal'
import {
  DEPOSIT_COLLATERAL_TEXT,
  DEPOSIT_UNDERLYING_TEXT,
  VIRTUAL_RATE_MAX_SLIPPAGE,
  WAD_DECIMALS,
  getBorrowAmountBelowDebtFloorText,
} from '@/src/constants/misc'
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
import { ONE_BIG_NUMBER, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { getHumanValue, getNonHumanValue, perSecondToAPR } from '@/src/web3/utils'
import { useTokenDecimalsAndBalance } from '@/src/hooks/useTokenDecimalsAndBalance'
import SuccessAnimation from '@/src/resources/animations/success-animation.json'

import { calculateHealthFactor } from '@/src/utils/data/positions'

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
  // const [swapSettingsOpen, setSwapSettingsOpen] = useState(false)

  const erc20 = useERC20Allowance(tokenAddress, userProxyAddress ?? '')
  const erc1155 = useERC155Allowance(tokenAddress, userProxyAddress ?? '')

  const activeToken = collateral.vault.type === 'NOTIONAL' ? erc1155 : erc20
  const { approve, hasAllowance, loadingApprove } = activeToken

  // const erc20Underlying = useERC20Allowance(collateral?.underlierAddress ?? '', userProxyAddress ?? '')
  // const erc1155Underlying = useERC155Allowance(collateral?.underlierAddress ?? '', userProxyAddress ?? '')
  // const activeTokenUnderlying = collateral.vault.type === 'NOTIONAL' ? erc1155Underlying : erc20Underlying
  // const { 
  //   approve: approveUnderlying, 
  //   hasAllowance: hasAllowanceUnderlying, 
  //   loadingApprove: loadingApproveUnderlying 
  // } = activeTokenUnderlying

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

  const { tokenInfo: underlyingInfo } = useTokenDecimalsAndBalance({
    tokenData: { 
      decimals: 8,
      symbol: collateral.underlierSymbol ?? '',
      address: collateral?.underlierAddress ?? '',
    },
    address: currentUserAddress,
    readOnlyAppProvider,
    tokenId: collateral.tokenId ?? '0',
  })

  const [FIATBalance] = useFIATBalance(true)

  const { depositCollateral, buyCollateralAndModifyDebtElement, buyCollateralAndModifyDebtNotional } = useUserActions(collateral.vault?.type)
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
    send({ type: 'SET_HAS_ALLOWANCE', hasAllowance })
    send({ type: 'SET_PROXY_AVAILABLE', isProxyAvailable })
  }, [hasAllowance, isProxyAvailable, send])

  const [tab, setTab] = useState('bond')
  const [mintFiat, setMintFiat] = useState(false)

  const toggleMintFiat = () => setMintFiat(!mintFiat)

  const createUnderlyingPositionNotional = async ({
    fiatAmount,
    underlierAmount,
  }: {
    underlierAmount: BigNumber
    fiatAmount: BigNumber
  }): Promise<void> => {
    const _underlierAmount = underlierAmount
      ? getNonHumanValue(underlierAmount, WAD_DECIMALS)
      : ZERO_BIG_NUMBER
    const _fiatAmount = fiatAmount ? getNonHumanValue(fiatAmount, WAD_DECIMALS) : ZERO_BIG_NUMBER
    try {
      setLoading(true)
      await buyCollateralAndModifyDebtNotional({
        vault: collateral.vault.address,
        token: tokenAddress,
        tokenId: 0,
        deltaDebt: _fiatAmount,
        underlierAmount: _underlierAmount
      })
      setLoading(false)
    } catch (err) {
      setLoading(false)
      throw err
    }
  }

  const createUnderlyingPositionElement = async ({
    fiatAmount,
    underlierAmount,
  }: {
    underlierAmount: BigNumber
    fiatAmount: BigNumber
  }): Promise<void> => {
    const _underlierAmount = underlierAmount
      ? getNonHumanValue(underlierAmount, WAD_DECIMALS)
      : ZERO_BIG_NUMBER
    const _fiatAmount = fiatAmount ? getNonHumanValue(fiatAmount, WAD_DECIMALS) : ZERO_BIG_NUMBER
    try {
      setLoading(true)
      await buyCollateralAndModifyDebtElement({
        vault: collateral.vault.address,
        deltaDebt: _fiatAmount,
        underlierAmount: _underlierAmount,
        swapParams: {
          balancerVault: collateral.vault.address,
          poolId: collateral.eptData?.poolId ?? '',
          assetIn: collateral.underlierAddress ?? '',
          assetOut: collateral.address ?? '',
          minOutput: 4, //currently hardcaded default... need to update this
          deadline: 300, //currently hardcaded default... need to update this
          approve: _underlierAmount.unscaleBy(WAD_DECIMALS).toNumber() * 1.2,  //approve 1.2x to give buffer 
        }
      })
      setLoading(false)
    } catch (err) {
      setLoading(false)
      throw err
    }
  }

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

  const createUnderlyingPosition = 
    collateral.vault.name.substring(0,8) === 'vaultEPT' 
    ? createUnderlyingPositionElement 
    : createUnderlyingPositionNotional

  const handleCreatePosition: any = () => {
    if (tab === 'bond') {
      send({
        type: 'CONFIRM',
        // @ts-ignore TODO types
        createPosition,
      })
    } else if (tab === 'underlying') {
      // approveUnderlying()
      send({
        type: 'CONFIRM_UNDERLYING',
        // @ts-ignore TODO types
        createUnderlyingPosition,
      })
    }
  }

  // @TODO: not working max amount
  // maxFIAT = totalCollateral*collateralValue/collateralizationRatio/(virtualRateSafetyMargin*virtualRate)-debt
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

  // @TODO: ui should show that the minimum fiat to have in a position is the debtFloor
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

  // how are these values defined? Right now they are hardcoded but I need to find that correct way to define them
  const underlyingData = [
    {
      title: 'Market rate',
      value: `1 Principal Token = .9949 ${collateral ? collateral.underlierSymbol : '-'}`,
    },
    {
      title: 'Price impact',
      value: '0.00%',
    },
    {
      title: 'Slippage tolerance',
      value: '0.30%',
    },
  ]

  const summaryData = [
    {
      title: 'In your wallet',
      value: `${tokenInfo?.humanValue} ${tokenSymbol}`,
    },
    {
      title: 'Depositing into position',
      value: `${stateMachine.context.erc20Amount.toFixed(4)} ${tokenSymbol}`,
    },
    {
      title: 'Remaining in wallet',
      value: `${tokenInfo?.humanValue
        ?.minus(stateMachine.context.erc20Amount)
        .toFixed(4)} ${tokenSymbol}`,
    },
    {
      title: 'FIAT to be minted',
      value: `${stateMachine.context.fiatAmount.toFixed(4)}`,
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
            {[1, 4].includes(stateMachine.context.currentStepNumber) && (
              <RadioTabsWrapper className={cn(s.radioTabsWrapper)}>
                <RadioTab checked={tab === 'bond'} onClick={() => setTab('bond')}>
                  Bond
                </RadioTab>
                <RadioTab checked={tab === 'underlying'} onClick={() => setTab('underlying')}>
                  Underlying
                </RadioTab>
              </RadioTabsWrapper>
            )}

            <Form form={form} initialValues={{ tokenAmount: 0, fiatAmount: 0, underlierAmount: 0 }}>
              {[1, 4].includes(stateMachine.context.currentStepNumber) && (
                <>
                  {tab === 'underlying' && (
                    <>
                      <Balance
                        title={`Swap and Deposit`}
                        value={`Balance: ${underlyingInfo?.humanValue?.toFixed(2)}`}
                      />
                      {/* <InternalArrow onClick={setSwapSettingsOpen(true)}/>
                      <SwapSettingsModal 
                        isOpen={swapSettingsOpen}
                        // toggleOpen={setSwapSettingsOpen}
                      /> */}
                      <Form.Item name="underlierAmount" required>
                        <TokenAmount
                          disabled={loading}
                          displayDecimals={underlyingInfo?.decimals}
                          mainAsset={collateral.vault.name} //only being used to fetch icon from metadata
                          max={underlyingInfo?.humanValue}
                          maximumFractionDigits={underlyingInfo?.decimals}
                          onChange={(val) =>
                            val && send({ type: 'SET_UNDERLIER_AMOUNT', underlierAmount: val })
                          }
                        />
                      </Form.Item>
                      {/*all of this is hardcoded */}
                      <Summary data={underlyingData} />
                      <SummaryItem title={'Fixed APR'} value={'2%'} />
                      <SummaryItem title={'Interest earned'} value={'24.028 USDC'} />
                      <SummaryItem
                        title={`Redeemable at maturity | ${
                          collateral?.maturity ? parseDate(collateral?.maturity) : '--:--:--'
                        }`}
                        value={'10,024.028 USDC'}
                      />
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
                          buttonText="Mint FIAT with this transaction"
                          disabled={loading}
                          onClick={toggleMintFiat}
                          top={
                            <Balance
                              title={`Mint FIAT`}
                              value={`Balance: ${FIATBalance.toFixed(4)}`}
                            />
                          }
                        />
                      )}
                    </>
                  )}

                  {tab === 'bond' && (
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
                          buttonText="Mint FIAT with this transaction"
                          disabled={loading}
                          onClick={toggleMintFiat}
                          top={
                            <Balance
                              title={`Mint FIAT`}
                              value={`Balance: ${FIATBalance.toFixed(4)}`}
                            />
                          }
                        />
                      )}
                    </>
                  )}
                </>
              )}
              <ButtonsWrapper>
                {stateMachine.context.currentStepNumber === 1 && (
                  <>
                    {!mintFiat && (
                      <ButtonExtraFormAction onClick={() => toggleMintFiat()}>
                        Mint FIAT with this transaction
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
                    <button className={cn(s.backButton)} onClick={() => send({ type: 'GO_BACK' })}>
                      &#8592; Go back
                    </button>
                  </>
                )}
                {stateMachine.context.currentStepNumber === 3 && (
                  <>
                    <ButtonGradient height="lg" loading={loadingApprove} onClick={approve}>
                      {`Set Allowance`}
                    </ButtonGradient>
                    <button className={cn(s.backButton)} onClick={() => send({ type: 'GO_BACK' })}>
                      &#8592; Go back
                    </button>
                  </>
                )}
                {stateMachine.context.currentStepNumber === 4 && (
                  <>
                    {!mintFiat && (
                      <ButtonExtraFormAction onClick={() => toggleMintFiat()}>
                        Mint FIAT with this transaction
                      </ButtonExtraFormAction>
                    )}
                    <ButtonGradient
                      disabled={isDisabledCreatePosition()}
                      height="lg"
                      onClick={handleCreatePosition}
                    >
                      {tab === 'underlying'
                        ? DEPOSIT_UNDERLYING_TEXT
                        : hasMinimumFIAT
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

  console.log(11, collateral)

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
      tooltip: 'The minimum amount of over-collateralization required to mint FIAT.',
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
