import s from './s.module.scss'
import { Form } from '@/src/components/antd'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { ButtonExtraFormAction } from '@/src/components/custom/button-extra-form-action'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { MintFiat } from '@/src/components/custom/mint-fiat'
import { Summary, SummaryItem } from '@/src/components/custom/summary'
import SwapSettingsModal from '@/src/components/custom/swap-settings-modal'
import TokenAmount from '@/src/components/custom/token-amount'
import { DEPOSIT_UNDERLYING_TEXT, WAD_DECIMALS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { useERC20Allowance } from '@/src/hooks/useERC20Allowance'
import { useTokenDecimalsAndBalance } from '@/src/hooks/useTokenDecimalsAndBalance'
import { useUserActions } from '@/src/hooks/useUserActions'
import useUserProxy from '@/src/hooks/useUserProxy'
import { getTokenBySymbol } from '@/src/providers/knownTokensProvider'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import underlyingStepperMachine from '@/src/state/open-position-underlying-form'
import { Collateral } from '@/src/utils/data/collaterals'
import { parseDate } from '@/src/utils/dateTime'
import { getHumanValue, getNonHumanValue } from '@/src/web3/utils'
import { useUnderlyingExchangeValue } from '@/src/hooks/useUnderlyingExchangeValue'
import { SettingFilled } from '@ant-design/icons'
import { useMachine } from '@xstate/react'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import { useEffect, useState } from 'react'

type CreatePositionUnderlyingProps = {
  collateral: Collateral
  loading: boolean
  healthFactorNumber: BigNumber
  hasMinimumFIAT: boolean
  marketRate: BigNumber
  setLoading: (newLoadingState: boolean) => void
  setMachine: (machine: any) => void
}

type FormProps = { underlierAmount: BigNumber }

export const CreatePositionUnderlying: React.FC<CreatePositionUnderlyingProps> = ({
  collateral,
  hasMinimumFIAT,
  healthFactorNumber,
  loading,
  marketRate,
  setLoading,
  setMachine,
}) => {
  const [form] = AntdForm.useForm<FormProps>()

  const underlierDecimals = getTokenBySymbol(collateral.underlierSymbol ?? '')?.decimals
  const { address: currentUserAddress, readOnlyAppProvider } = useWeb3Connection()
  const { isProxyAvailable, loadingProxy, setupProxy, userProxyAddress } = useUserProxy()
  /* const { buyCollateralAndModifyDebtERC20, buyCollateralAndModifyDebtERC1155 } = useUserActions( */
  /*   collateral.vault?.type, */
  /* ) */
  const { buyCollateralAndModifyDebtERC20 } = useUserActions(collateral.vault?.type)

  const erc20 = useERC20Allowance(collateral?.underlierAddress ?? '', userProxyAddress ?? '')
  const { approve, hasAllowance, loadingApprove } = erc20

  const [stateMachine, send] = useMachine(underlyingStepperMachine, {
    context: {
      isProxyAvailable,
      hasAllowance,
      tokenAddress: collateral.underlierAddress ?? '',
      tokenSymbol: collateral.underlierSymbol ?? '',
    },
  })

  useEffect(() => {
    setMachine(stateMachine)
  }, [stateMachine, setMachine])

  useEffect(() => {
    send({ type: 'SET_HAS_ALLOWANCE', hasAllowance })
    send({ type: 'SET_PROXY_AVAILABLE', isProxyAvailable })
  }, [hasAllowance, isProxyAvailable, send])

  const [mintFiat, setMintFiat] = useState(false)
  const [swapSettingsOpen, setSwapSettingsOpen] = useState(false)
  const [slippageTolerance, setSlippageTolerance] = useState(0.1)
  const [maxTransactionTime, setMaxTransactionTime] = useState(20)

  const toggleSwapSettingsMenu = () => {
    setSwapSettingsOpen(!swapSettingsOpen)
  }

  const isDisabledCreatePosition = () => {
    return !hasAllowance || !isProxyAvailable || loading || !hasMinimumFIAT
  }

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

  const [underlierToPToken] = useUnderlyingExchangeValue({
    vault: collateral?.vault?.address ?? '',
    balancerVault: collateral?.eptData?.balancerVault,
    curvePoolId: collateral?.eptData?.poolId,
    underlierAmount: getNonHumanValue(new BigNumber(1), underlierDecimals), //single underlier value
  })

  const underlyingData = [
    {
      title: 'Market rate',
      value: `1 Principal Token = ${marketRate.toFixed(4)} ${
        collateral ? collateral.underlierSymbol : '-'
      }`,
    },
    // {
    //   title: 'Price impact',
    //   value: `${priceImpact.toFixed(2)}%`,
    // },
    {
      title: 'Slippage tolerance',
      value: `${slippageTolerance.toFixed(2)}%`,
    },
  ]

  const underlierAmount = stateMachine.context.underlierAmount.toNumber()
  const apr = (1 - marketRate.toNumber()) * 100
  const fixedAPR = `${apr.toFixed(2)}%`
  const interestEarned = `${Number(underlierAmount * (apr / 100)).toFixed(2)}`
  const redeemable = `${Number(underlierAmount) + Number(interestEarned)} ${
    collateral ? collateral.underlierSymbol : '-'
  }`
  // create position flow
  // TODO:
  const createUnderlyingPositionERC1155 = async ({
    fiatAmount,
    underlierAmount,
  }: {
    underlierAmount: BigNumber
    fiatAmount: BigNumber
  }): Promise<void> => {
    console.log('todo: make 1155 action work', fiatAmount, underlierAmount)
    return Promise.resolve()
    /* const _underlierAmount = underlierAmount */
    /*   ? getNonHumanValue(underlierAmount, WAD_DECIMALS) */
    /*   : ZERO_BIG_NUMBER */
    /* const _fiatAmount = fiatAmount ? getNonHumanValue(fiatAmount, WAD_DECIMALS) : ZERO_BIG_NUMBER */
    /* const fCashAmount = getHumanValue(underlierToFCash, WAD_DECIMALS).multipliedBy(underlierAmount) */

    /* try { */
    /*   setLoading(true) */
    /*   await buyCollateralAndModifyDebtERC1155({ */
    /*     vault: collateral.vault.address, */
    /*     token: collateral.address ?? '', */
    /*     tokenId: Number(collateral.tokenId), */
    /*     deltaDebt: _fiatAmount, */
    /*     fCashAmount: getHumanValue(fCashAmount, 53), // 41 puts us at 18decimals, 53 puts us at 6 decimals */
    /*     minImpliedRate: 1000000, */
    /*     underlierAmount: _underlierAmount, //definitely correct */
    /*   }) */
    /*   setLoading(false) */
    /* } catch (err) { */
    /*   setLoading(false) */
    /*   throw err */
    /* } */
  }

  const createUnderlyingPositionERC20 = async ({
    fiatAmount,
    underlierAmount,
  }: {
    underlierAmount: BigNumber
    fiatAmount: BigNumber
  }): Promise<void> => {
    // Underlier amount formatted with proper decimals
    const _underlierAmount = underlierAmount
      ? getNonHumanValue(underlierAmount, underlierDecimals)
      : ZERO_BIG_NUMBER
    // Fiat amount formatted with proper decimals
    const _fiatAmount = fiatAmount ? getNonHumanValue(fiatAmount, WAD_DECIMALS) : ZERO_BIG_NUMBER

    const deadline = Number((Date.now() / 1000).toFixed(0)) + maxTransactionTime * 60
    const pTokenAmount = underlierAmount.multipliedBy(
      getHumanValue(underlierToPToken, underlierDecimals),
    )
    const slippageDecimal = 1 - slippageTolerance / 100
    const minOutput = getNonHumanValue(
      pTokenAmount.multipliedBy(slippageDecimal),
      underlierDecimals,
    )
    const approve = _underlierAmount.toFixed(0, 8)

    try {
      setLoading(true)
      await buyCollateralAndModifyDebtERC20({
        vault: collateral.vault.address,
        deltaDebt: _fiatAmount,
        virtualRate: collateral.vault.virtualRate,
        underlierAmount: _underlierAmount,
        swapParams: {
          balancerVault: collateral.eptData.balancerVault,
          poolId: collateral.eptData?.poolId ?? '',
          assetIn: collateral.underlierAddress ?? '',
          assetOut: collateral.address ?? '',
          minOutput: minOutput.toFixed(0, 8),
          deadline: deadline,
          approve: approve,
        },
      })
      setLoading(false)
    } catch (err) {
      setLoading(false)
      throw err
    }
  }

  const createUnderlyingPosition =
    collateral.vault.name.substring(0, 8) === 'vaultEPT'
      ? createUnderlyingPositionERC20
      : createUnderlyingPositionERC1155

  const updateSwapSettings = (slippageTolerance: number, maxTransactionTime: number) => {
    setSlippageTolerance(slippageTolerance)
    setMaxTransactionTime(maxTransactionTime)
  }

  return (
    <Form form={form} initialValues={{ underlierAmount: 0 }}>
      {[1, 4].includes(stateMachine.context.currentStepNumber) && (
        <>
          <div>
            <div className={cn(s.flexContainer)}>
              <h3 className={cn(s.label)}>Swap and Deposit</h3>
              <div className={cn(s.rightGutter)}>
                <p className={cn(s.balance)}>{`Balance: ${underlyingInfo?.humanValue?.toFixed(
                  2,
                )}`}</p>
                <SettingFilled className={cn(s.settings)} onClick={toggleSwapSettingsMenu} />
              </div>
            </div>
            <SwapSettingsModal
              isOpen={swapSettingsOpen}
              maxTransactionTime={maxTransactionTime}
              slippageTolerance={slippageTolerance}
              toggleOpen={toggleSwapSettingsMenu}
              updateSwapSettings={updateSwapSettings}
            />
            <Form.Item name="underlierAmount" required>
              <TokenAmount
                disabled={loading}
                displayDecimals={underlyingInfo?.decimals}
                mainAsset={collateral?.vault?.name} //only being used to fetch icon from metadata
                max={underlyingInfo?.humanValue}
                maximumFractionDigits={underlyingInfo?.decimals}
                onChange={(val) =>
                  val && send({ type: 'SET_UNDERLIER_AMOUNT', underlierAmount: val })
                }
                slider
              />
            </Form.Item>
            <div className={cn(s.summary)}>
              <Summary data={underlyingData} />
              <SummaryItem title={'Fixed APR'} value={fixedAPR} />
              <SummaryItem title={'Interest earned'} value={interestEarned} />
              <SummaryItem
                title={`Redeemable at maturity | ${
                  collateral?.maturity ? parseDate(collateral?.maturity) : '--:--:--'
                }`}
                value={redeemable}
              />
            </div>
            {mintFiat && (
              <MintFiat
                activeMachine={stateMachine}
                collateral={collateral}
                healthFactorNumber={healthFactorNumber}
                loading={loading}
                marketRate={marketRate}
                send={send}
              />
            )}
          </div>
        </>
      )}
      <ButtonsWrapper>
        {stateMachine.context.currentStepNumber === 1 && (
          <>
            {!isProxyAvailable && (
              <ButtonGradient height="lg" onClick={() => send({ type: 'CLICK_SETUP_PROXY' })}>
                Setup Proxy
              </ButtonGradient>
            )}
            {isProxyAvailable && !hasAllowance && (
              <ButtonGradient
                disabled={!stateMachine.context.underlierAmount.gt(0) || !isProxyAvailable}
                height="lg"
                onClick={() => send({ type: 'CLICK_ALLOW' })}
              >
                {stateMachine.context.underlierAmount.gt(0)
                  ? 'Set Allowance'
                  : `Insufficient Balance for ${collateral.underlierSymbol}`}
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
              <ButtonExtraFormAction onClick={() => setMintFiat(!mintFiat)}>
                Mint FIAT with this transaction
              </ButtonExtraFormAction>
            )}
            <ButtonGradient
              disabled={isDisabledCreatePosition()}
              height="lg"
              onClick={() =>
                send({
                  type: 'CONFIRM',
                  // @ts-ignore TODO types
                  createUnderlyingPosition,
                })
              }
            >
              {DEPOSIT_UNDERLYING_TEXT}
            </ButtonGradient>
          </>
        )}
      </ButtonsWrapper>
      {stateMachine.context.currentStepNumber === 4 && (
        <div className={cn(s.summary)}>{/* <Summary data={summaryData} /> */}</div>
      )}
    </Form>
  )
}
