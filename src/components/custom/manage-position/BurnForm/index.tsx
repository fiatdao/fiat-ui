import s from './s.module.scss'
import cn from 'classnames'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { useState } from 'react'
import { RefetchPositionById } from '@/src/hooks/subgraph/usePosition'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { contracts } from '@/src/constants/contracts'
import { useBurnForm } from '@/src/hooks/managePosition'
import { getNonHumanValue } from '@/src/web3/utils'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { SummaryItem } from '@/src/components/custom/summary'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { ButtonExtraFormAction } from '@/src/components/custom/button-extra-form-action'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { Balance } from '@/src/components/custom/balance'
import { FormExtraAction } from '@/src/components/custom/form-extra-action'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { Position } from '@/src/utils/data/positions'

type BurnFormFields = {
  burn: BigNumber
  withdraw: BigNumber
}

export const BurnForm = ({
  position,
  refetch,
}: {
  refetch: RefetchPositionById
  position?: Position
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const {
    approveToken,
    burn: burnFIAT,
    fiatAllowance,
    fiatInfo,
    tokenInfo,
    updateFiat,
  } = useBurnForm({ tokenAddress: position?.collateral.address })
  const [form] = AntdForm.useForm<BurnFormFields>()

  const handleBurn = async ({ burn, withdraw }: BurnFormFields) => {
    try {
      const toWithdraw = withdraw ? getNonHumanValue(withdraw, 18) : ZERO_BIG_NUMBER
      const toBurn = burn ? getNonHumanValue(burn, 18) : ZERO_BIG_NUMBER
      setSubmitting(true)

      if (fiatAllowance?.lt(toBurn.toFixed())) {
        await approveToken()
      }
      await burnFIAT({
        vault: position?.protocolAddress ?? '',
        token: position?.collateral.address ?? '',
        tokenId: 0,
        toWithdraw,
        toBurn,
      })

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
            displayDecimals={contracts.FIAT.decimals}
            max={Number(fiatInfo?.toFixed(2))} // TODO: fails sometimes (use with low numbers)
            maximumFractionDigits={contracts.FIAT.decimals}
            slider
            tokenIcon={<FiatIcon />}
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
                  mainAsset={position?.protocol} // TODO: fails sometimes (use with low numbers)
                  max={tokenInfo?.humanValue}
                  maximumFractionDigits={tokenInfo?.decimals}
                  secondaryAsset={position?.underlier.symbol}
                  slider
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
