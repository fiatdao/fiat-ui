import s from './s.module.scss'
import cn from 'classnames'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { ZERO_ADDRESS, ZERO_BN } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { useDepositForm } from '@/src/hooks/managePosition'
import { iconByAddress } from '@/src/utils/managePosition'
import { getNonHumanValue } from '@/src/web3/utils'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { SummaryItem } from '@/src/components/custom/summary'

export const DepositForm = ({
  tokenAddress,
  vaultAddress,
}: {
  tokenAddress: string
  vaultAddress: string
}) => {
  const { address, tokenInfo, userActions, userProxy } = useDepositForm({ tokenAddress })
  const [form] = AntdForm.useForm()

  const handleDeposit = async ({ deposit }: { deposit: BigNumber }) => {
    if (!tokenInfo || !userProxy || !address) {
      return
    }

    const toDeposit = getNonHumanValue(deposit, tokenInfo.decimals)

    const addCollateralEncoded = userActions.interface.encodeFunctionData(
      'modifyCollateralAndDebt',
      [vaultAddress, tokenAddress, address, ZERO_ADDRESS, toDeposit.toFixed(), ZERO_BN],
    )

    const tx = await userProxy.execute(userActions.address, addCollateralEncoded, {
      gasLimit: 1_000_000,
    })
    console.log('adding collateral...', tx.hash)

    const receipt = await tx.wait()
    console.log('Collateral added!', { receipt })
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
    <Form form={form} onFinish={handleDeposit}>
      <Form.Item name="deposit" required>
        <TokenAmount
          displayDecimals={tokenInfo?.decimals}
          max={tokenInfo?.humanValue}
          maximumFractionDigits={tokenInfo?.decimals}
          slider
          tokenIcon={iconByAddress[tokenAddress]}
        />
      </Form.Item>
      <ButtonGradient height="lg" htmlType="submit">
        Deposit
      </ButtonGradient>
      <div className={cn(s.summary)}>
        {mockedData.map((item, index) => (
          <SummaryItem key={index} title={item.title} value={item.value} />
        ))}
      </div>
    </Form>
  )
}
