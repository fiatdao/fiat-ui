import s from './s.module.scss'
import cn from 'classnames'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { useState } from 'react'
import { WAIT_BLOCKS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { useWithdrawForm } from '@/src/hooks/managePosition'
import { iconByAddress } from '@/src/utils/managePosition'
import { getNonHumanValue } from '@/src/web3/utils'
import { RefetchPositionById } from '@/src/hooks/subgraph/usePosition'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { SummaryItem } from '@/src/components/custom/summary'

type WithdrawFormFields = {
  withdraw: BigNumber
}

export const WithdrawForm = ({
  refetch,
  tokenAddress,
  userBalance,
  vaultAddress,
}: {
  refetch: RefetchPositionById
  tokenAddress: string
  userBalance?: BigNumber
  vaultAddress: string
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const { address, tokenInfo, userActions, userProxy } = useWithdrawForm({ tokenAddress })
  const [form] = AntdForm.useForm<WithdrawFormFields>()

  const handleWithdraw = async ({ withdraw }: WithdrawFormFields) => {
    if (!userProxy || !address) {
      return
    }

    const toWithdraw = withdraw ? getNonHumanValue(withdraw, 18) : ZERO_BIG_NUMBER

    const removeCollateralEncoded = userActions.interface.encodeFunctionData(
      'modifyCollateralAndDebt',
      [
        vaultAddress,
        tokenAddress,
        0,
        address,
        address,
        toWithdraw.negated().toFixed(),
        ZERO_BIG_NUMBER.toFixed(),
      ],
    )
    setSubmitting(true)
    try {
      const tx = await userProxy.execute(userActions.address, removeCollateralEncoded, {
        gasLimit: 1_000_000,
      })
      await tx.wait(WAIT_BLOCKS)
      // if we `WAIT_BLOCKS` we can prevent false positives due to a fork and may be waiting for the
      // subgraph to be updated
      await refetch()
      form.resetFields()
    } catch (err) {
      console.log('Failed to Withdraw', err)
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
    <Form form={form} onFinish={handleWithdraw}>
      {tokenInfo && userBalance && (
        <fieldset disabled={submitting}>
          <Form.Item name="withdraw" required>
            <TokenAmount
              disabled={submitting}
              displayDecimals={tokenInfo?.decimals}
              max={userBalance}
              maximumFractionDigits={tokenInfo?.decimals}
              slider
              tokenIcon={iconByAddress[tokenAddress]}
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
      )}
    </Form>
  )
}
