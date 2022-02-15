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
import { RefetchPositionById } from '@/src/hooks/subgraph/usePosition'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { SummaryItem } from '@/src/components/custom/summary'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { ButtonExtraFormAction } from '@/src/components/custom/button-extra-form-action'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { Balance } from '@/src/components/custom/balance'
import { FormExtraAction } from '@/src/components/custom/form-extra-action'
import { ZERO_ADDRESS, ZERO_BIG_NUMBER } from '@/src/constants/misc'

export const BurnForm = ({
  refetch,
  userBalance,
  vaultAddress,
}: {
  refetch: RefetchPositionById
  userBalance?: BigNumber
  vaultAddress: string
}) => {
  const { address, fiatInfo, userActions, userProxy } = useBurnForm()
  const [form] = AntdForm.useForm()

  const handleBurn = async ({ burn }: { burn: BigNumber }) => {
    if (!fiatInfo || !userProxy || !address) {
      return
    }

    const toBurn = getNonHumanValue(burn, contracts.FIAT.decimals)

    if (fiatInfo.allowance.lt(toBurn.toFixed())) {
      await fiatInfo.approve()
    }

    const decreaseDebtEncoded = userActions.interface.encodeFunctionData(
      'modifyCollateralAndDebt',
      [
        vaultAddress,
        ZERO_ADDRESS,
        0,
        ZERO_ADDRESS,
        address,
        ZERO_BIG_NUMBER.toFixed(),
        toBurn.negated().toFixed(),
      ],
    )

    const tx = await userProxy.execute(userActions.address, decreaseDebtEncoded, {
      gasLimit: 1_000_000,
    })
    console.log('burning...', tx.hash)

    const receipt = await tx.wait()
    console.log('Debt (FIAT) burnt', { receipt })

    // force update the value via SG query
    refetch()
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
      <Form.Item name="burn" required>
        <TokenAmount
          displayDecimals={contracts.FIAT.decimals}
          max={userBalance}
          maximumFractionDigits={contracts.FIAT.decimals}
          slider
          tokenIcon={iconByAddress[contracts.FIAT.address[Chains.goerli]]}
        />
      </Form.Item>
      {withdrawCollateral && (
        <FormExtraAction
          bottom={
            <Form.Item name="fiatAmount" required style={{ marginBottom: 0 }}>
              <TokenAmount
                disabled={false}
                displayDecimals={4}
                max={10000}
                maximumFractionDigits={6}
                onChange={() => console.log('mint!')}
                slider
                tokenIcon={<FiatIcon />}
              />
            </Form.Item>
          }
          buttonText={withdrawCollateralButtonText}
          onClick={toggleWithdrawCollateral}
          top={<Balance title="Select amount to burn" value="Balance: 4,800" />}
        />
      )}
      <ButtonsWrapper>
        {!withdrawCollateral && (
          <ButtonExtraFormAction onClick={() => toggleWithdrawCollateral()}>
            {withdrawCollateralButtonText}
          </ButtonExtraFormAction>
        )}
        <ButtonGradient height="lg" htmlType="submit">
          Burn
        </ButtonGradient>
      </ButtonsWrapper>
      <div className={cn(s.summary)}>
        {mockedData.map((item, index) => (
          <SummaryItem key={index} title={item.title} value={item.value} />
        ))}
      </div>
    </Form>
  )
}
