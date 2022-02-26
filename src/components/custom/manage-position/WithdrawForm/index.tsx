import s from './s.module.scss'
import cn from 'classnames'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { useState } from 'react'
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
  withdraw: BigNumber
}

export const WithdrawForm = ({
  position,
  refetch,
}: {
  refetch: RefetchPositionById
  position: Position
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const { tokenInfo, withdraw: withdrawCollateral } = useWithdrawForm({
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
  const newMaxWithdrawAmount = position.totalCollateral.minus(normalDebtWithColRatio)

  const mockedData = [
    {
      title: 'Current collateral value',
      value: `$${getHumanValue(position.totalCollateral, WAD_DECIMALS).toFixed(3)}`,
    },
    {
      title: 'Outstanding FIAT debt',
      value: `${getHumanValue(position.totalNormalDebt, WAD_DECIMALS).toFixed(3)}`,
    },
    {
      title: 'New FIAT debt',
      value: `${getHumanValue(position.totalNormalDebt, WAD_DECIMALS).toFixed(3)}`,
    },
    {
      title: 'Stability feed',
      value: `0`,
    },
  ]

  return (
    <Form form={form} onFinish={handleWithdraw}>
      <fieldset disabled={submitting}>
        <Form.Item name="withdraw" required>
          <TokenAmount
            disabled={submitting}
            displayDecimals={tokenInfo?.decimals}
            mainAsset={position.protocol} // TODO: fails sometimes (use with low numbers)
            max={Number(getHumanValue(newMaxWithdrawAmount, WAD_DECIMALS)?.toFixed(2))}
            maximumFractionDigits={tokenInfo?.decimals}
            secondaryAsset={position.underlier.symbol}
            slider
          />
        </Form.Item>
        <ButtonGradient height="lg" htmlType="submit" loading={submitting}>
          Withdraw
        </ButtonGradient>
        <div className={cn(s.summary)}>
          {mockedData.map((item, index) => (
            <SummaryItem key={index} title={item.title} value={item.value} />
          ))}
        </div>
      </fieldset>
    </Form>
  )
}
