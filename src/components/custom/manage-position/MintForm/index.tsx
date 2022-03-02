import s from './s.module.scss'
import cn from 'classnames'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { useState } from 'react'
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

export const MintForm = ({
  position,
  refetch,
}: {
  refetch: RefetchPositionById
  position: Position
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const { mint: mintFIAT, updateFiat } = useMintForm()
  const [form] = AntdForm.useForm()

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

  const mintAmount = (form.getFieldValue('mint') || ZERO_BIG_NUMBER) as BigNumber
  const newNormalDebt = mintAmount.plus(position.totalNormalDebt)
  const normalDebtWithColRatio = position.totalNormalDebt.times(
    position.vaultCollateralizationRatio || 1,
  )
  const newMaxMintAmount = position.totalCollateral.minus(normalDebtWithColRatio)

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
      value: `${getHumanValue(newNormalDebt, WAD_DECIMALS).toFixed(3)}`,
    },
    {
      title: 'Stability feed',
      value: `0`,
    },
  ]

  return (
    <Form form={form} onFinish={handleMint}>
      <fieldset disabled={submitting}>
        <Form.Item name="mint" required>
          <TokenAmount
            disabled={submitting}
            displayDecimals={contracts.FIAT.decimals}
            max={Number(getHumanValue(newMaxMintAmount, WAD_DECIMALS)?.toFixed(2))}
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
