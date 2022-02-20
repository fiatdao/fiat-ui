import s from './s.module.scss'
import cn from 'classnames'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { useState } from 'react'
import { contracts } from '@/src/constants/contracts'
import { WAIT_BLOCKS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { useDepositForm } from '@/src/hooks/managePosition'
import { iconByAddress } from '@/src/utils/managePosition'
import { getNonHumanValue } from '@/src/web3/utils'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { SummaryItem } from '@/src/components/custom/summary'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { ButtonExtraFormAction } from '@/src/components/custom/button-extra-form-action'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { Balance } from '@/src/components/custom/balance'
import { FormExtraAction } from '@/src/components/custom/form-extra-action'

type DepositFormFields = {
  deposit: BigNumber
  fiatAmount: BigNumber
}

export const DepositForm = ({
  tokenAddress,
  vaultAddress,
}: {
  tokenAddress: string
  vaultAddress: string
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [maxFiatValue, setMaxFiatValue] = useState<BigNumber | undefined>()
  const { address, fiatInfo, tokenInfo, updateFiat, updateToken, userActions, userProxy } =
    useDepositForm({
      tokenAddress,
    })
  const [form] = AntdForm.useForm<DepositFormFields>()

  const calculateAndSetMaxFiat = (amountToDeposit: BigNumber) => {
    setMaxFiatValue(
      amountToDeposit
        // TODO: remove the hardcoded 1.1 factor
        .dividedBy(1.1)
        .decimalPlaces(contracts.FIAT.decimals),
    )
  }

  const [mintFiat, setMintFiat] = useState(false)
  const toggleMintFiat = () => {
    setMintFiat((prevStatus) => !prevStatus)
  }
  const mintButtonText = 'Mint fiat with this transaction'

  const handleDeposit = async ({ deposit, fiatAmount }: DepositFormFields) => {
    if (!tokenInfo || !userProxy || !address) {
      return
    }

    const toDeposit = deposit ? getNonHumanValue(deposit, 18) : ZERO_BIG_NUMBER
    const toMint = fiatAmount ? getNonHumanValue(fiatAmount, 18) : ZERO_BIG_NUMBER

    const addCollateralEncoded = userActions.interface.encodeFunctionData(
      'modifyCollateralAndDebt',
      [
        vaultAddress,
        tokenAddress,
        0,
        address, // user Address
        address, // user Address
        toDeposit.toFixed(),
        toMint.toFixed(),
      ],
    )

    setSubmitting(true)

    try {
      const tx = await userProxy.execute(userActions.address, addCollateralEncoded, {
        gasLimit: 1_000_000,
      })
      await tx.wait(WAIT_BLOCKS)
      // form reset (better with xstate?)
      await Promise.all([updateToken(), updateFiat()])
      toggleMintFiat()
      calculateAndSetMaxFiat(ZERO_BIG_NUMBER)
      form.resetFields()
    } catch (err) {
      console.error('Failed to Deposit', err)
    } finally {
      setSubmitting(false)
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
      {tokenInfo && fiatInfo && (
        <fieldset disabled={submitting}>
          <Form.Item name="deposit" required>
            <TokenAmount
              disabled={submitting}
              displayDecimals={tokenInfo.decimals}
              max={tokenInfo.humanValue}
              maximumFractionDigits={tokenInfo.decimals}
              onChange={(value) => {
                if (value) {
                  calculateAndSetMaxFiat(value)
                }
              }}
              slider
              tokenIcon={iconByAddress[tokenAddress]}
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
              top={<Balance title="Mint FIAT" value={`Available: ${fiatInfo.humanValue}`} />}
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
      )}
    </Form>
  )
}
