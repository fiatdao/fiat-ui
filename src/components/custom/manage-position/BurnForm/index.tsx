import s from './s.module.scss'
import cn from 'classnames'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { RefetchPositionById } from '@/src/hooks/subgraph/usePosition'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { contracts } from '@/src/constants/contracts'
import { useBurnForm, useBurnFormSummary } from '@/src/hooks/managePosition'
import { getHumanValue, getNonHumanValue } from '@/src/web3/utils'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { SummaryItem } from '@/src/components/custom/summary'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { ButtonExtraFormAction } from '@/src/components/custom/button-extra-form-action'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { Balance } from '@/src/components/custom/balance'
import { FormExtraAction } from '@/src/components/custom/form-extra-action'
import { WAD_DECIMALS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { Position } from '@/src/utils/data/positions'

export type BurnFormFields = {
  burn: BigNumber
  withdraw: BigNumber
}

export const BurnForm = ({
  position,
  refetch,
}: {
  refetch: RefetchPositionById
  position: Position
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [maxWithdrawValue, setMaxWithdrawValue] = useState<BigNumber>()
  const {
    approveFiatAllowance,
    approveMonetaAllowance,
    burn: burnFIAT,
    hasFiatAllowance,
    hasMonetaAllowance,
    tokenInfo,
    updateFiat,
  } = useBurnForm({ tokenAddress: position?.collateral.address })
  const [form] = AntdForm.useForm<BurnFormFields>()
  const summary = useBurnFormSummary(position, form.getFieldsValue())

  const calculateAndSetMaxWithdrawValue = useCallback(
    (burnAmount: BigNumber) => {
      const humanValueTotalNormalDebt = getHumanValue(position.totalNormalDebt, WAD_DECIMALS)
      const humanValueTotalCollateral = getHumanValue(position.totalCollateral, WAD_DECIMALS)

      const newNormalDebt = humanValueTotalNormalDebt.minus(burnAmount)
      const normalDebtWithColRatio = newNormalDebt.times(position.vaultCollateralizationRatio || 1)
      const newMaxWithdrawAmount = humanValueTotalCollateral.minus(normalDebtWithColRatio)

      setMaxWithdrawValue(newMaxWithdrawAmount)
    },
    [position.totalCollateral, position.totalNormalDebt, position.vaultCollateralizationRatio],
  )

  const handleBurn = async ({ burn, withdraw }: BurnFormFields) => {
    try {
      const toWithdraw = withdraw ? getNonHumanValue(withdraw, WAD_DECIMALS) : ZERO_BIG_NUMBER
      const toBurn = burn ? getNonHumanValue(burn, WAD_DECIMALS) : ZERO_BIG_NUMBER
      setSubmitting(true)

      if (!hasFiatAllowance) {
        await approveFiatAllowance()
      } else if (!hasMonetaAllowance) {
        await approveMonetaAllowance()
      } else {
        await burnFIAT({
          vault: position?.protocolAddress ?? '',
          token: position?.collateral.address ?? '',
          tokenId: 0,
          toWithdraw,
          toBurn,
        })
        await Promise.all([refetch(), updateFiat()])
        form.resetFields()
      }
    } catch (err) {
      console.log('Failed to burn FIAT', err)
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    calculateAndSetMaxWithdrawValue(ZERO_BIG_NUMBER)
  }, [calculateAndSetMaxWithdrawValue])

  const [withdrawCollateral, setWithdrawCollateral] = useState(false)
  const toggleWithdrawCollateral = () => setWithdrawCollateral(!withdrawCollateral)
  const withdrawCollateralButtonText = 'Withdraw Collateral'
  const burnButtonText = !hasFiatAllowance
    ? 'Set allowance for Proxy'
    : !hasMonetaAllowance
    ? 'Enable Proxy for FIAT'
    : 'Repay Debt'

  return (
    <Form form={form} onFinish={handleBurn}>
      <fieldset disabled={submitting}>
        <Form.Item name="burn" required>
          <TokenAmount
            disabled={submitting}
            displayDecimals={contracts.FIAT.decimals}
            max={Number(getHumanValue(position.totalNormalDebt, WAD_DECIMALS)?.toFixed(2))}
            maximumFractionDigits={contracts.FIAT.decimals}
            onChange={(val) => val && calculateAndSetMaxWithdrawValue(val)}
            slider
            tokenIcon={<FiatIcon />}
          />
        </Form.Item>
        {withdrawCollateral && (
          <FormExtraAction
            bottom={
              <Form.Item name="withdraw" required style={{ marginBottom: 0 }}>
                <TokenAmount
                  disabled={submitting}
                  displayDecimals={4}
                  mainAsset={position?.protocol}
                  max={Number(maxWithdrawValue?.toFixed(2))}
                  maximumFractionDigits={6}
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
            {burnButtonText}
          </ButtonGradient>
        </ButtonsWrapper>
        <div className={cn(s.summary)}>
          {summary.map((item, index) => (
            <SummaryItem key={index} title={item.title} value={item.value} />
          ))}
        </div>
      </fieldset>
    </Form>
  )
}
