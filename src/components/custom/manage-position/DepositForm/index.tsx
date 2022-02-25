import s from './s.module.scss'
import cn from 'classnames'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'
import { contracts } from '@/src/constants/contracts'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { useDepositForm } from '@/src/hooks/managePosition'
import { getNonHumanValue } from '@/src/web3/utils'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { SummaryItem } from '@/src/components/custom/summary'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { ButtonExtraFormAction } from '@/src/components/custom/button-extra-form-action'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { Balance } from '@/src/components/custom/balance'
import { FormExtraAction } from '@/src/components/custom/form-extra-action'
import { Position } from '@/src/utils/data/positions'

type DepositFormFields = {
  deposit: BigNumber
  fiatAmount: BigNumber
}

export const DepositForm = ({ position }: { position: Position }) => {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [maxFiatValue, setMaxFiatValue] = useState<BigNumber | undefined>()
  const {
    deposit: depositCollateral,
    fiatInfo,
    tokenInfo,
  } = useDepositForm({
    tokenAddress: position.collateral.address,
  })

  const [form] = AntdForm.useForm<DepositFormFields>()

  const calculateAndSetMaxFiat = useCallback((amountToDeposit?: BigNumber) => {
    if (amountToDeposit) {
      const FACTOR = 1.1
      setMaxFiatValue(
        amountToDeposit
          // TODO: remove the hardcoded 1.1 factor
          .dividedBy(FACTOR)
          .decimalPlaces(contracts.FIAT.decimals),
      )
    }
  }, [])

  const [mintFiat, setMintFiat] = useState(false)
  const toggleMintFiat = () => {
    setMintFiat((prevStatus) => !prevStatus)
    if (!maxFiatValue) {
      calculateAndSetMaxFiat(ZERO_BIG_NUMBER)
    }
  }
  const mintButtonText = 'Mint fiat with this transaction'

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

  const mockedData = [
    {
      title: 'Current collateral value',
      value: '$5,000',
    },
    {
      title: 'Outstanding FIAT debt',
      value: '0',
    },
    {
      title: 'New FIAT debt',
      value: '0',
    },
    {
      title: 'Stability feed',
      value: '0',
    },
  ]

  return (
    <Form form={form} onFinish={handleDeposit}>
      <fieldset disabled={submitting}>
        <Form.Item name="deposit" required>
          <TokenAmount
            disabled={submitting}
            displayDecimals={tokenInfo?.decimals}
            mainAsset={position.protocol}
            max={tokenInfo?.humanValue}
            maximumFractionDigits={tokenInfo?.decimals}
            onChange={(value) => calculateAndSetMaxFiat(value)}
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
                  displayDecimals={contracts.FIAT.decimals}
                  max={maxFiatValue}
                  maximumFractionDigits={contracts.FIAT.decimals}
                  slider
                  tokenIcon={<FiatIcon />}
                />
              </Form.Item>
            }
            buttonText={mintButtonText}
            onClick={toggleMintFiat}
            top={<Balance title="Mint FIAT" value={`Available: ${fiatInfo}`} />}
          />
        )}
        <ButtonsWrapper>
          {!mintFiat && (
            <ButtonExtraFormAction onClick={() => toggleMintFiat()}>
              {mintButtonText}
            </ButtonExtraFormAction>
          )}
          <ButtonGradient height="lg" htmlType="submit" loading={submitting}>
            Deposit
          </ButtonGradient>
        </ButtonsWrapper>
        <div className={cn(s.summary)}>
          {mockedData.map((item, index) => (
            <SummaryItem key={index} title={item.title} value={item.value} />
          ))}
        </div>
      </fieldset>
    </Form>
  )
}
