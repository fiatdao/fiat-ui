import s from './s.module.scss'
import { Form } from '@/src/components/antd'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { Balance } from '@/src/components/custom/balance'
import { ButtonExtraFormAction } from '@/src/components/custom/button-extra-form-action'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { MintFiat } from '@/src/components/custom/mint-fiat'
import { Summary } from '@/src/components/custom/summary'
import TokenAmount from '@/src/components/custom/token-amount'
import { WAD_DECIMALS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { useERC155Allowance } from '@/src/hooks/useERC1155Allowance'
import { useERC20Allowance } from '@/src/hooks/useERC20Allowance'
import { useTokenDecimalsAndBalance } from '@/src/hooks/useTokenDecimalsAndBalance'
import { useUserActions } from '@/src/hooks/useUserActions'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import stepperMachine from '@/src/state/open-position-form'
import { Collateral } from '@/src/utils/data/collaterals'
import { calculateHealthFactor } from '@/src/utils/data/positions'
import { getHealthFactorState } from '@/src/utils/table'
import { getNonHumanValue } from '@/src/web3/utils'
import { useMachine } from '@xstate/react'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import { useEffect, useMemo, useState } from 'react'

type CreatePositionBondProps = {
  collateral: Collateral
  confirmButtonText: string
  loading: boolean
  hasMinimumFIAT: boolean
  setLoading: (newLoadingState: boolean) => void
  setMachine: (machine: any) => void
  tokenAddress: string
}

type FormProps = { underlierAmount: BigNumber }

export const CreatePositionBond: React.FC<CreatePositionBondProps> = ({
  collateral,
  confirmButtonText,
  hasMinimumFIAT,
  loading,
  setLoading,
  setMachine,
  tokenAddress,
}) => {
  const [form] = AntdForm.useForm<FormProps>()

  const { address: currentUserAddress, readOnlyAppProvider } = useWeb3Connection()
  const { isProxyAvailable, loadingProxy, setupProxy, userProxyAddress } = useUserProxy()
  const { depositCollateral } = useUserActions(collateral.vault?.type)

  const erc20 = useERC20Allowance(tokenAddress, userProxyAddress ?? '')
  const erc1155 = useERC155Allowance(tokenAddress, userProxyAddress ?? '')
  const activeToken = collateral?.vault?.type === 'NOTIONAL' ? erc1155 : erc20
  const { approve, hasAllowance, loadingApprove } = activeToken

  const [stateMachine, send] = useMachine(stepperMachine, {
    context: {
      isProxyAvailable,
      hasAllowance,
      tokenAddress,
      tokenSymbol: collateral?.symbol ?? '',
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

  const hasSufficientCollateral = useMemo(() => {
    return tokenInfo?.humanValue?.gte(stateMachine.context.erc20Amount)
  }, [tokenInfo?.humanValue, stateMachine.context.erc20Amount])

  const isDisabledCreatePosition = useMemo(() => {
    return (
      !hasAllowance || !isProxyAvailable || loading || !hasMinimumFIAT || !hasSufficientCollateral
    )
  }, [hasAllowance, isProxyAvailable, loading, hasMinimumFIAT, hasSufficientCollateral])

  const deltaCollateral = getNonHumanValue(stateMachine.context.erc20Amount, WAD_DECIMALS)
  const deltaDebt = getNonHumanValue(stateMachine.context.fiatAmount, WAD_DECIMALS)
  const { healthFactor: hf } = calculateHealthFactor(
    collateral.currentValue,
    collateral.vault.collateralizationRatio,
    deltaCollateral,
    deltaDebt,
  )
  const healthFactorNumber = hf?.toFixed(3)

  // TODO: use SummaryBuilder to build this summary data
  const summaryData = [
    {
      title: 'In your wallet',
      value: `${tokenInfo?.humanValue} ${collateral?.symbol}`,
    },
    {
      title: 'Depositing into position',
      value: `${stateMachine.context.erc20Amount.toFixed(4)} ${collateral?.symbol}`,
    },
    {
      title: 'Remaining in wallet',
      value: `${tokenInfo?.humanValue?.minus(stateMachine.context.erc20Amount).toFixed(4)} ${
        collateral?.symbol
      }`,
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
        virtualRate: collateral.vault.virtualRate,
      })
      setLoading(false)
    } catch (err) {
      setLoading(false)
      throw err
    }
  }

  const getActionButton = () => {
    if (stateMachine.context.currentStepNumber === 1) {
      return (
        <>
          {!isProxyAvailable && (
            <ButtonGradient height="lg" onClick={() => send({ type: 'CLICK_SETUP_PROXY' })}>
              Setup Proxy
            </ButtonGradient>
          )}
          {isProxyAvailable && !hasAllowance && (
            <ButtonGradient
              disabled={!isProxyAvailable}
              height="lg"
              onClick={() => send({ type: 'CLICK_ALLOW' })}
            >
              Set Allowance
            </ButtonGradient>
          )}
        </>
      )
    } else if (stateMachine.context.currentStepNumber === 2) {
      return (
        <>
          <ButtonGradient height="lg" loading={loadingProxy} onClick={setupProxy}>
            Create Proxy
          </ButtonGradient>
          <button className={cn(s.backButton)} onClick={() => send({ type: 'GO_BACK' })}>
            &#8592; Go back
          </button>
        </>
      )
    } else if (stateMachine.context.currentStepNumber === 3) {
      return (
        <>
          <ButtonGradient height="lg" loading={loadingApprove} onClick={approve}>
            {`Set Allowance`}
          </ButtonGradient>
          <button className={cn(s.backButton)} onClick={() => send({ type: 'GO_BACK' })}>
            &#8592; Go back
          </button>
        </>
      )
    }

    return (
      <ButtonGradient
        disabled={isDisabledCreatePosition}
        height="lg"
        onClick={() =>
          send({
            type: 'CONFIRM',
            // @ts-ignore TODO types
            createPosition,
          })
        }
      >
        {confirmButtonText}
      </ButtonGradient>
    )
  }

  return (
    <Form form={form} initialValues={{ tokenAmount: 0, fiatAmount: 0 }}>
      {[1, 4].includes(stateMachine.context.currentStepNumber) && (
        <>
          <Balance
            title={`Deposit ${stateMachine.context.tokenSymbol}`}
            value={`Balance: ${tokenInfo?.humanValue?.toFixed()}`}
          />
          <Form.Item name="tokenAmount" required>
            <TokenAmount
              displayDecimals={tokenInfo?.decimals}
              healthFactorValue={hf}
              mainAsset={collateral.vault.name}
              max={tokenInfo?.humanValue}
              maximumFractionDigits={tokenInfo?.decimals}
              onChange={(val) => val && send({ type: 'SET_ERC20_AMOUNT', erc20Amount: val })}
              slider
              sliderDisabled={loading || tokenInfo?.humanValue?.eq(0)}
            />
          </Form.Item>
          {mintFiat && (
            <MintFiat
              activeMachine={stateMachine}
              collateral={collateral}
              healthFactorNumber={hf}
              loading={loading}
              send={send}
            />
          )}
        </>
      )}
      <ButtonsWrapper>
        <>
          {!mintFiat &&
            stateMachine.context.currentStepNumber !== 2 &&
            stateMachine.context.currentStepNumber !== 3 && (
              <ButtonExtraFormAction onClick={() => setMintFiat(!mintFiat)}>
                Mint FIAT with this transaction
              </ButtonExtraFormAction>
            )}
          {getActionButton()}
        </>
      </ButtonsWrapper>
      {stateMachine.context.currentStepNumber !== 2 &&
        stateMachine.context.currentStepNumber !== 3 && (
          <div className={cn(s.summary)}>
            <Summary data={summaryData} />
          </div>
        )}
    </Form>
  )
}
