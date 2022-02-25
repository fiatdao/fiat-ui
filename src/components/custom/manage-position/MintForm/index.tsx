import s from './s.module.scss'
import cn from 'classnames'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { useMemo, useState } from 'react'
import { WAD_DECIMALS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { contracts } from '@/src/constants/contracts'
import { useMintForm } from '@/src/hooks/managePosition'
import { getHumanValue, getNonHumanValue } from '@/src/web3/utils'
import { RefetchPositionById } from '@/src/hooks/subgraph/usePosition'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { SummaryItem } from '@/src/components/custom/summary'
import { Position } from '@/src/utils/data/positions'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'

const calculateRemainingFiat = (userBalance: BigNumber, fiatAmount: BigNumber) => {
  // TODO: remove the hardcoded 1.1 factor
  return userBalance.dividedBy(1.1).decimalPlaces(contracts.FIAT.decimals).minus(fiatAmount)
}

export const MintForm = ({
  position,
  refetch,
}: {
  refetch: RefetchPositionById
  position?: Position
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const { fiatInfo, mint: mintFIAT, updateFiat } = useMintForm()
  const [form] = AntdForm.useForm()

  const maxFiatValue = useMemo<BigNumber | undefined>(() => {
    // FixMe: this works when the component is mounted, but needs to be updated after form submit
    if (position?.totalCollateral && fiatInfo) {
      return calculateRemainingFiat(
        position?.totalCollateral,
        BigNumber.from(fiatInfo) ?? ZERO_BIG_NUMBER,
      )
    }
  }, [position?.totalCollateral, fiatInfo])

  const handleMint = async ({ mint }: { mint: BigNumber }) => {
    try {
      const toMint = mint ? getNonHumanValue(mint, 18) : ZERO_BIG_NUMBER
      setSubmitting(true)
      await mintFIAT({
        vault: position?.protocolAddress ?? '',
        token: position?.collateral.address ?? '',
        tokenId: 0,
        toMint,
      })
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
            max={Number(getHumanValue(maxFiatValue, WAD_DECIMALS)?.toFixed(2))} // TODO: fails sometimes (use with low numbers)
            maximumFractionDigits={contracts.FIAT.decimals}
            slider
            tokenIcon={<FiatIcon />}
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
