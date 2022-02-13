import { Button } from 'antd'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { ZERO_ADDRESS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { useWithdrawForm } from '@/src/hooks/managePosition'
import { iconByAddress } from '@/src/utils/managePosition'
import { getNonHumanValue } from '@/src/web3/utils'
import { RefetchPositionById } from '@/src/hooks/subgraph/usePosition'

export const WithdrawForm = ({
  refetch,
  tokenAddress,
  userBalance,
  vaultAddress,
}: {
  refetch: RefetchPositionById
  tokenAddress: string
  userBalance?: BigNumber
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
      [
        vaultAddress,
        tokenAddress,
        address,
        ZERO_ADDRESS,
        toWithdraw.negated().toFixed(),
        ZERO_BIG_NUMBER.toFixed(),
      ],
    )

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
