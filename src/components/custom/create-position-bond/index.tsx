import s from './s.module.scss'

import { getHealthFactorState } from '@/src/utils/table'
import { calculateHealthFactor } from '@/src/utils/data/positions'
import { Collateral } from '@/src/utils/data/collaterals'

import { Balance } from '@/src/components/custom/balance'
import TokenAmount from '@/src/components/custom/token-amount'
import { Form } from '@/src/components/antd'
import { Summary } from '@/src/components/custom/summary'
import { ButtonExtraFormAction } from '@/src/components/custom/button-extra-form-action'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { MintFiat } from '@/src/components/custom/mint-fiat'

import { useTokenDecimalsAndBalance } from '@/src/hooks/useTokenDecimalsAndBalance'
import { useERC20Allowance } from '@/src/hooks/useERC20Allowance'
import { useERC155Allowance } from '@/src/hooks/useERC1155Allowance'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useUserActions } from '@/src/hooks/useUserActions'

import { getNonHumanValue } from '@/src/web3/utils'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import stepperMachine from '@/src/state/open-position-form'
import {
  DEPOSIT_COLLATERAL_TEXT,
  WAD_DECIMALS,
  getBorrowAmountBelowDebtFloorText,
} from '@/src/constants/misc'
import BigNumber from 'bignumber.js'
import AntdForm from 'antd/lib/form'
import { useMachine } from '@xstate/react'
import { useEffect, useMemo, useState } from 'react'
import cn from 'classnames'

type Props = {
  collateral: Collateral
  loading: boolean
  isDisabledCreatePosition: () => boolean
  setLoading: (newLoadingState: boolean) => void
  setMachine: (machine: any) => void
  tokenAddress: string
}

type FormProps = { underlierAmount: BigNumber }

export const CreatePositionBond: React.FC<Props> = ({
  collateral,
  isDisabledCreatePosition,
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

  // @TODO: ui should show that the minimum fiat to have in a position is the debtFloor
  const hasMinimumFIAT = useMemo(() => {
    const fiatAmount = stateMachine.context.fiatAmount ?? ZERO_BIG_NUMBER
    const debtFloor = collateral.vault.debtFloor
    const nonHumanFiatAmount = getNonHumanValue(fiatAmount, WAD_DECIMALS) ?? ZERO_BIG_NUMBER

    return nonHumanFiatAmount.gte(debtFloor) || nonHumanFiatAmount.isZero()
  }, [stateMachine.context.fiatAmount, collateral.vault.debtFloor])

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
      })
      setLoading(false)
    } catch (err) {
      setLoading(false)
      throw err
    }
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
              disabled={loading}
              displayDecimals={tokenInfo?.decimals}
              mainAsset={collateral.vault.name}
              max={tokenInfo?.humanValue}
              maximumFractionDigits={tokenInfo?.decimals}
              onChange={(val) => val && send({ type: 'SET_ERC20_AMOUNT', erc20Amount: val })}
              slider
            />
          </Form.Item>
          {mintFiat && (
            <MintFiat
              activeMachine={stateMachine}
              collateral={collateral}
              healthFactorNumber={healthFactorNumber}
              loading={loading}
              send={send}
            />
          )}
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
                disabled={!stateMachine.context.erc20Amount.gt(0) || !isProxyAvailable}
                height="lg"
                onClick={() => send({ type: 'CLICK_ALLOW' })}
              >
                {stateMachine.context.erc20Amount.gt(0)
                  ? 'Set Allowance'
                  : `Insufficient Balance for ${collateral?.symbol}`}
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
  )
}
