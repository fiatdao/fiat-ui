import s from './s.module.scss'
import cn from 'classnames'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { useState } from 'react'
import { RefetchPositionById } from '@/src/hooks/subgraph/usePosition'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { Chains } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { useBurnForm } from '@/src/hooks/managePosition'
import { iconByAddress } from '@/src/utils/managePosition'
import { getNonHumanValue } from '@/src/web3/utils'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { SummaryItem } from '@/src/components/custom/summary'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { ButtonExtraFormAction } from '@/src/components/custom/button-extra-form-action'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { Balance } from '@/src/components/custom/balance'
import { FormExtraAction } from '@/src/components/custom/form-extra-action'
import { ZERO_ADDRESS, ZERO_BIG_NUMBER } from '@/src/constants/misc'

type BurnFormFields = {
  burn: BigNumber
  withdraw: BigNumber
}

export const BurnForm = ({
  refetch,
  tokenAddress,
  userBalance,
  vaultAddress,
}: {
  refetch: RefetchPositionById
  vaultAddress?: string
  userBalance?: BigNumber
  tokenAddress?: string
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const {
    address,
    fiatAllowance,
    fiatInfo,
    tokenInfo,
    updateAllowance,
    updateFiat,
    userActions,
    userProxy,
  } = useBurnForm({ tokenAddress })
  const [form] = AntdForm.useForm<BurnFormFields>()

  // FixMe: txs are failing, burning or burning and withdrawing
  const handleBurn = async ({ burn, withdraw }: BurnFormFields) => {
    if (!fiatInfo || !userProxy || !address || !tokenAddress || !vaultAddress) {
      return
    }

    const toBurn = burn ? getNonHumanValue(burn, 18) : ZERO_BIG_NUMBER
    const toWithdraw = withdraw ? getNonHumanValue(withdraw, 18) : ZERO_BIG_NUMBER

    try {
      setSubmitting(true)

      if (fiatAllowance?.lt(toBurn.toFixed())) {
        await updateAllowance()
      }

      const decreaseDebtEncoded = userActions.interface.encodeFunctionData(
        'modifyCollateralAndDebt',
        [
          vaultAddress,
          tokenAddress,
          0,
          toWithdraw.isZero() ? ZERO_ADDRESS : address,
          address,
          toWithdraw.negated().toFixed(),
          toBurn.negated().toFixed(),
        ],
      )

      console.log([
        vaultAddress,
        tokenAddress,
        0,
        toWithdraw.isZero() ? ZERO_ADDRESS : address,
        address,
        toWithdraw.negated().toFixed(),
        toBurn.negated().toFixed(),
      ])

      const tx = await userProxy.execute(userActions.address, decreaseDebtEncoded, {
        gasLimit: 1_000_000,
      })

      await tx.wait()
      await Promise.all([refetch(), updateFiat()])
      form.resetFields()
    } catch (err) {
      console.log('Failed to burn FIAT', err)
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

  const [withdrawCollateral, setWithdrawCollateral] = useState(false)
  const toggleWithdrawCollateral = () => setWithdrawCollateral(!withdrawCollateral)
  const withdrawCollateralButtonText = 'Withdraw Collateral'

  return (
    <Form form={form} onFinish={handleBurn}>
      <fieldset disabled={submitting}>
        <Form.Item name="burn" required>
          <TokenAmount
            disabled={submitting}
            displayDecimals={fiatInfo?.decimals}
            max={fiatInfo?.humanValue}
            maximumFractionDigits={fiatInfo?.decimals}
            slider
            tokenIcon={iconByAddress[contracts.FIAT.address[Chains.goerli]]}
          />
        </Form.Item>
        {withdrawCollateral && (
          <FormExtraAction
            bottom={
              <Form.Item name="withdraw" required style={{ marginBottom: 0 }}>
                {/* TODO: max={userBalance.plus(burn.times(1.1))} ??? */}
                <TokenAmount
                  disabled={submitting}
                  displayDecimals={tokenInfo?.decimals}
                  max={userBalance}
                  maximumFractionDigits={tokenInfo?.decimals}
                  slider
                  tokenIcon={<FiatIcon />}
                />
              </Form.Item>
            }
            buttonText={withdrawCollateralButtonText}
            onClick={toggleWithdrawCollateral}
            top={<Balance title="Collateral" value={`Available: ${tokenInfo?.humanValue}`} />}
          />
        )}
        <ButtonsWrapper>
          {!withdrawCollateral && (
            <ButtonExtraFormAction onClick={() => toggleWithdrawCollateral()}>
              {withdrawCollateralButtonText}
            </ButtonExtraFormAction>
          )}
          <ButtonGradient height="lg" htmlType="submit" loading={submitting}>
            Burn
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
