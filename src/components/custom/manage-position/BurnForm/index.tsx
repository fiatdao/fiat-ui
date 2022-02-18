import s from './s.module.scss'
import cn from 'classnames'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { useState } from 'react'
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
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'

type HandleBurnForm = {
  burn: BigNumber
  fiatAmount: BigNumber
}

export const BurnForm = ({
  tokenAddress,
  vaultAddress,
}: {
  vaultAddress: string
  tokenAddress: string
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const { address, fiatAllowance, fiatInfo, tokenInfo, updateAllowance, userActions, userProxy } =
    useBurnForm({ tokenAddress })
  const [form] = AntdForm.useForm()

  const handleBurn = async ({ burn, fiatAmount }: HandleBurnForm) => {
    if (!fiatInfo || !userProxy || !address) {
      return
    }

    const toBurn = burn ? getNonHumanValue(burn, 18) : ZERO_BIG_NUMBER
    const toFiatAmount = fiatAmount ? getNonHumanValue(fiatAmount, 18) : ZERO_BIG_NUMBER

    try {
      setSubmitting(true)
      if (fiatAllowance && fiatAllowance.lt(toBurn.toFixed())) {
        await updateAllowance()
      }
      const decreaseDebtEncoded = userActions.interface.encodeFunctionData(
        'modifyCollateralAndDebt',
        [
          vaultAddress,
          tokenAddress,
          0,
          address,
          address,
          toBurn.negated().toFixed(),
          toFiatAmount.negated().toFixed(),
        ],
      )
      // @TODO: FIX ME ............
      const tx = await userProxy.execute(userActions.address, decreaseDebtEncoded, {
        gasLimit: 1_000_000,
      })
      await tx.wait()
    } catch (err) {
      console.log(err)
    } finally {
      setSubmitting(submitting)
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
        <Form.Item name="fiatAmount" required>
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
              <Form.Item name="burn" required style={{ marginBottom: 0 }}>
                <TokenAmount
                  disabled={submitting}
                  displayDecimals={tokenInfo?.decimals}
                  max={tokenInfo?.humanValue}
                  maximumFractionDigits={tokenInfo?.decimals}
                  slider
                  tokenIcon={<FiatIcon />}
                />
              </Form.Item>
            }
            buttonText={withdrawCollateralButtonText}
            onClick={toggleWithdrawCollateral}
            top={<Balance title="Mint FIAT" value={`Available: ${tokenInfo?.humanValue}`} />}
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
