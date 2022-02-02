import { Button } from 'antd'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { KeyedMutator } from 'swr'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { useWithdrawForm } from '@/src/hooks/managePosition'
import { iconByAddress } from '@/src/utils/managePosition'
import { Position } from '@/src/utils/your-positions-api'
import { getNonHumanValue } from '@/src/web3/utils'

export const WithdrawForm = ({
  refetch,
  tokenAddress,
  userBalance,
  vaultAddress,
}: {
  refetch: KeyedMutator<Position | undefined>
  tokenAddress: string
  userBalance?: number
  vaultAddress: string
}) => {
  const { userActions, userProxy, vaultInfo } = useWithdrawForm({ vaultAddress })
  const [form] = AntdForm.useForm()

  const handleWithdraw = async ({ withdraw }: { withdraw: BigNumber }) => {
    if (!vaultInfo || !userProxy) {
      return
    }

    const toWithdraw = getNonHumanValue(withdraw, vaultInfo.decimals)

    const removeCollateralEncoded = userActions.interface.encodeFunctionData('removeCollateral', [
      vaultAddress,
      tokenAddress,
      toWithdraw.toFixed(),
    ])

    const tx = await userProxy.execute(userActions.address, removeCollateralEncoded, {
      gasLimit: 1_000_000,
    })
    console.log('withdrawing...', tx.hash)

    const receipt = await tx.wait()
    console.log('Collateral withdrawn', { receipt })

    refetch()
  }

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
      <Form.Item>
        <Button htmlType="submit" type="primary">
          Withdraw collateral
        </Button>
      </Form.Item>
    </Form>
  )
}
