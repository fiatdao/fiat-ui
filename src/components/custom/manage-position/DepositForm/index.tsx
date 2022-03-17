import s from './s.module.scss'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import { useCallback, useState } from 'react'
import { Form } from '@/src/components/antd'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { TokenAmount } from '@/src/components/custom'
import { Balance } from '@/src/components/custom/balance'
import { ButtonExtraFormAction } from '@/src/components/custom/button-extra-form-action'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { FormExtraAction } from '@/src/components/custom/form-extra-action'
import { SummaryItem } from '@/src/components/custom/summary'
import { contracts } from '@/src/constants/contracts'
import { WAD_DECIMALS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { useDepositForm, useDepositFormSummary } from '@/src/hooks/managePosition'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { Position } from '@/src/utils/data/positions'
import { getNonHumanValue } from '@/src/web3/utils'

const DEFAULT_HEALTH_FACTOR = ''
const MINT_BUTTON_TEXT = 'Mint FIAT with this transaction'

export type DepositFormFields = {
  deposit?: BigNumber
  fiatAmount?: BigNumber
}

export const DepositForm = ({ position }: { position: Position }) => {
  const [form] = AntdForm.useForm<DepositFormFields>()
  const { deposit } = form.getFieldsValue()
  const summary = useDepositFormSummary(position, form.getFieldsValue())

  const [submitting, setSubmitting] = useState<boolean>(false)
  const [healthFactor, setHealthFactor] = useState(ZERO_BIG_NUMBER.toFixed())

  const {
    currentValue,
    deposit: depositCollateral,
    tokenInfo,
  } = useDepositForm({
    tokenAddress: position.collateral.address,
    vaultAddress: position.protocolAddress,
  })

  const [maxFiatValue, setMaxFiatValue] = useState<BigNumber | undefined>()
  const calculateAndSetMaxFiat = useCallback(
    (amountToDeposit?: BigNumber) => {
      if (amountToDeposit) {
        const FACTOR = position.vaultCollateralizationRatio || 1

        setMaxFiatValue(
          amountToDeposit
            .plus(position.totalCollateral.unscaleBy(WAD_DECIMALS))
            .dividedBy(FACTOR)
            .decimalPlaces(contracts.FIAT.decimals),
        )
      }
    },
    [position.totalCollateral, position.vaultCollateralizationRatio],
  )

  const [mintFiat, setMintFiat] = useState(false)
  const toggleMintFiat = () => {
    setMintFiat((prevStatus) => !prevStatus)
    if (!maxFiatValue) {
      calculateAndSetMaxFiat(ZERO_BIG_NUMBER)
    }
  }

  const handleDeposit = async ({ deposit, fiatAmount }: DepositFormFields) => {
    try {
      const toDeposit = deposit ? getNonHumanValue(deposit, 18) : ZERO_BIG_NUMBER
      const toMint = fiatAmount ? getNonHumanValue(fiatAmount, 18) : ZERO_BIG_NUMBER
      setSubmitting(true)
      await depositCollateral({
        vault: position.protocolAddress,
        token: position.collateral.address,
        tokenId: 0,
        toDeposit,
        toMint,
      })
    } catch (err) {
      console.error('Failed to Deposit', err)
    } finally {
      setSubmitting(false)
      toggleMintFiat()
      calculateAndSetMaxFiat(ZERO_BIG_NUMBER)
      form.resetFields()
    }
  }

  const handleValuesChange = (...args: any[]) => {
    const [modifiedField, formFields] = args
    if (modifiedField.deposit) {
      calculateAndSetMaxFiat(modifiedField.deposit)
    }

    // when any value is updated, and fiatAmount is other than `undefined`
    if (formFields.fiatAmount) {
      // this way we ensure the 'healthFactor' is re-calculated when `fiatAmount` is updated
      setHealthFactor(
        currentValue
          .times(position.totalCollateral.unscaleBy(WAD_DECIMALS).plus(args[1].deposit))
          .div(position.totalNormalDebt.unscaleBy(WAD_DECIMALS).plus(args[1].fiatAmount))
          .unscaleBy(18)
          .toFixed(2),
      )
    }

    return args
  }

  return (
    <Form form={form} onFinish={handleDeposit} onValuesChange={handleValuesChange}>
      <fieldset disabled={submitting}>
        <Balance
          title="Select amount to deposit"
          value={`Available: ${tokenInfo?.humanValue?.toFixed()}`}
        />
        <Form.Item name="deposit" required>
          <TokenAmount
            disabled={submitting}
            displayDecimals={tokenInfo?.decimals}
            mainAsset={position.protocol}
            max={tokenInfo?.humanValue}
            maximumFractionDigits={tokenInfo?.decimals}
            secondaryAsset={position.underlier.symbol}
            slider
          />
        </Form.Item>
        {mintFiat && (
          <FormExtraAction
            bottom={
              <Form.Item name="fiatAmount" required style={{ marginBottom: 0 }}>
                <TokenAmount
                  disabled={submitting}
                  displayDecimals={4}
                  healthFactorValue={
                    !isFinite(Number(healthFactor)) ? DEFAULT_HEALTH_FACTOR : healthFactor
                  }
                  max={maxFiatValue}
                  maximumFractionDigits={6}
                  slider="healthFactorVariant"
                  tokenIcon={<FiatIcon />}
                />
              </Form.Item>
            }
            buttonText={MINT_BUTTON_TEXT}
            onClick={toggleMintFiat}
            top={
              <Balance
                title="Mint FIAT"
                value={`Available: ${maxFiatValue?.toFixed(4, BigNumber.ROUND_DOWN)}`}
              />
            }
          />
        )}
        <ButtonsWrapper>
          {!mintFiat && (
            <ButtonExtraFormAction disabled={!deposit} onClick={() => toggleMintFiat()}>
              {MINT_BUTTON_TEXT}
            </ButtonExtraFormAction>
          )}
          <ButtonGradient height="lg" htmlType="submit" loading={submitting}>
            Deposit
          </ButtonGradient>
        </ButtonsWrapper>
        <div className={cn(s.summary)}>
          {summary.map((item, index) => (
            <SummaryItem key={index} title={item.title} value={item.value} />
          ))}
        </div>
      </fieldset>
    </Form>
  )
}
