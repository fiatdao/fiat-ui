import s from './s.module.scss'
import cn from 'classnames'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { useState } from 'react'
import { Balance } from '@/src/components/custom/balance'
import { WAD_DECIMALS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { useWithdrawForm } from '@/src/hooks/managePosition'
import { getHumanValue, getNonHumanValue } from '@/src/web3/utils'
import { RefetchPositionById } from '@/src/hooks/subgraph/usePosition'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { SummaryItem } from '@/src/components/custom/summary'
import { Position } from '@/src/utils/data/positions'

type WithdrawFormFields = {
  withdraw?: BigNumber
}

export const WithdrawForm = ({
  position,
  refetch,
}: {
  refetch: RefetchPositionById
  position: Position
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const { withdraw: withdrawCollateral } = useWithdrawForm({
    tokenAddress: position.collateral.address,
  })
  const [form] = AntdForm.useForm<WithdrawFormFields>()

  const handleWithdraw = async ({ withdraw }: WithdrawFormFields) => {
    try {
      const toWithdraw = withdraw ? getNonHumanValue(withdraw, 18) : ZERO_BIG_NUMBER
      setSubmitting(true)
      await withdrawCollateral({
        vault: position.protocolAddress,
        token: position.collateral.address,
        tokenId: 0, // TODO: depends on the protocol
        toWithdraw,
      })
    } catch (err) {
      console.error('Failed to withdraw', err)
    } finally {
      setSubmitting(false)
      await refetch()
      form.resetFields()
    }
  }

  const normalDebtWithColRatio = position.totalNormalDebt.times(
    position.vaultCollateralizationRatio || 1,
  )

  //collateralDeposited - fiatDebt*collateralizationRatio/collateralValue
  const newMaxWithdrawAmount = position.totalCollateral.minus(
    normalDebtWithColRatio.div(position.collateralValue),
  )

  const { withdraw = 0 } = form.getFieldsValue()

  const summary = [
    {
      title: 'Current collateral deposited',
      value: getHumanValue(position.totalCollateral, WAD_DECIMALS).toFixed(3),
    },
    {
      title: 'New collateral deposited',
      // FixMe: value not updating on screen like it does on `DepositForm`
      value: getHumanValue(position.totalCollateral, WAD_DECIMALS).minus(withdraw).toFixed(3),
    },
    {
      title: 'Outstanding FIAT debt',
      value: getHumanValue(position.totalNormalDebt, WAD_DECIMALS).toFixed(3),
    },
    {
      title: 'New FIAT debt',
      value: getHumanValue(position.totalNormalDebt, WAD_DECIMALS).toFixed(3),
    },
  ]

  return (
    <Form form={form} onFinish={handleWithdraw}>
      <fieldset disabled={submitting}>
        <Balance
          title="Select amount to withdraw"
          value={`Available: ${getHumanValue(newMaxWithdrawAmount, WAD_DECIMALS).toFixed(
            4,
            BigNumber.ROUND_FLOOR,
          )}`}
        />
        <Form.Item name="withdraw" required>
          <TokenAmount
            disabled={submitting}
            displayDecimals={4}
            mainAsset={position.protocol}
            max={getHumanValue(newMaxWithdrawAmount, WAD_DECIMALS)}
            maximumFractionDigits={6}
            secondaryAsset={position.underlier.symbol}
            slider
          />
        </Form.Item>
        <ButtonGradient height="lg" htmlType="submit" loading={submitting}>
          Withdraw
        </ButtonGradient>
        <div className={cn(s.summary)}>
          {summary.map((item, index) => (
            <SummaryItem key={index} title={item.title} value={item.value} />
          ))}
        </div>
      </fieldset>
    </Form>
  )
}
