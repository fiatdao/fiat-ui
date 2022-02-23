import s from './s.module.scss'
import cn from 'classnames'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { useMemo, useState } from 'react'
import { WAIT_BLOCKS, ZERO_ADDRESS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { Chains } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { useMintForm } from '@/src/hooks/managePosition'
import { iconByAddress } from '@/src/utils/managePosition'
import { getNonHumanValue } from '@/src/web3/utils'
import { RefetchPositionById } from '@/src/hooks/subgraph/usePosition'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { SummaryItem } from '@/src/components/custom/summary'

const calculateRemainingFiat = (userBalance: BigNumber, fiatAmount: BigNumber) => {
  // TODO: remove the hardcoded 1.1 factor
  return userBalance.dividedBy(1.1).decimalPlaces(contracts.FIAT.decimals).minus(fiatAmount)
}

export const MintForm = ({
  refetch,
  userBalance,
  vaultAddress,
}: {
  refetch: RefetchPositionById
  userBalance?: BigNumber
  vaultAddress?: string
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const { address, fiatInfo, updateFiat, userActions, userProxy } = useMintForm()
  const [form] = AntdForm.useForm()

  const maxFiatValue = useMemo<BigNumber | undefined>(() => {
    // FixMe: this works when the component is mounted, but needs to be updated after form submit
    if (userBalance && fiatInfo) {
      return calculateRemainingFiat(userBalance, BigNumber.from(fiatInfo) ?? ZERO_BIG_NUMBER)
    }
  }, [userBalance, fiatInfo])

  const handleMint = async ({ mint }: { mint: BigNumber }) => {
    if (!userProxy || !address || !vaultAddress || !userBalance || !fiatInfo) {
      return
    }

    const toMint = getNonHumanValue(mint, contracts.FIAT.decimals)

    const increaseDebtEncoded = userActions.interface.encodeFunctionData(
      'modifyCollateralAndDebt',
      [
        vaultAddress,
        ZERO_ADDRESS,
        0,
        ZERO_ADDRESS,
        address,
        ZERO_BIG_NUMBER.toFixed(),
        toMint.toFixed(),
      ],
    )

    setSubmitting(true)

    try {
      const tx = await userProxy.execute(userActions.address, increaseDebtEncoded, {
        gasLimit: 1_000_000,
      })
      await tx.wait(WAIT_BLOCKS)
      await Promise.all([refetch(), updateFiat()])
      form.resetFields()
    } catch (err) {
      console.log('Failed to mint FIAT', err)
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
    <Form form={form} onFinish={handleMint}>
      <fieldset disabled={submitting}>
        <Form.Item name="mint" required>
          <TokenAmount
            disabled={submitting}
            displayDecimals={contracts.FIAT.decimals}
            max={maxFiatValue}
            maximumFractionDigits={contracts.FIAT.decimals}
            slider
            tokenIcon={iconByAddress[contracts.FIAT.address[Chains.goerli]]}
          />
        </Form.Item>
        <ButtonGradient height="lg" htmlType="submit" loading={submitting}>
          Mint
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
