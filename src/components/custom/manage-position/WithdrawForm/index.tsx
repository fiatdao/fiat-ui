import s from './s.module.scss'
import cn from 'classnames'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { ZERO_ADDRESS, ZERO_BN } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { useWithdrawForm } from '@/src/hooks/managePosition'
import { iconByAddress } from '@/src/utils/managePosition'
import { getNonHumanValue } from '@/src/web3/utils'
import { RefetchPositionById } from '@/src/hooks/subgraph/usePosition'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { SummaryItem } from '@/src/components/custom/summary'

export const WithdrawForm = ({
  refetch,
  tokenAddress,
  userBalance,
  vaultAddress,
}: {
  refetch: RefetchPositionById
  tokenAddress: string
  userBalance?: number
  vaultAddress: string
}) => {
  const { address, userActions, userProxy, vaultInfo } = useWithdrawForm({ vaultAddress })
  const [form] = AntdForm.useForm()

  const handleWithdraw = async ({ withdraw }: { withdraw: BigNumber }) => {
    if (!vaultInfo || !userProxy || !address) {
      return
    }

    const toWithdraw = getNonHumanValue(withdraw, vaultInfo.decimals)

    const removeCollateralEncoded = userActions.interface.encodeFunctionData(
      'modifyCollateralAndDebt',
      [vaultAddress, tokenAddress, address, ZERO_ADDRESS, toWithdraw.times(-1).toFixed(), ZERO_BN],
    )

    const tx = await userProxy.execute(userActions.address, removeCollateralEncoded, {
      gasLimit: 1_000_000,
    })
    console.log('withdrawing...', tx.hash)

    const receipt = await tx.wait()
    console.log('Collateral withdrawn', { receipt })

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

  return (
    <Form form={form} onFinish={handleWithdraw}>
      <Form.Item name="withdraw" required>
        <TokenAmount
          disabled={false}
          displayDecimals={vaultInfo?.decimals}
          max={userBalance}
          maximumFractionDigits={vaultInfo?.decimals}
          slider
          tokenIcon={iconByAddress[tokenAddress]}
        />
      </Form.Item>
      <ButtonGradient height="lg" htmlType="submit">
        Withdraw
      </ButtonGradient>
      <div className={cn(s.summary)}>
        {mockedData.map((item, index) => (
          <SummaryItem key={index} title={item.title} value={item.value} />
        ))}
      </div>
    </Form>
  )
}
