import { Button } from 'antd'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { ZERO_ADDRESS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { useDepositForm } from '@/src/hooks/managePosition'
import { iconByAddress } from '@/src/utils/managePosition'
import { getNonHumanValue } from '@/src/web3/utils'

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
      [
        vaultAddress,
        tokenAddress,
        address,
        ZERO_ADDRESS,
        toDeposit.toFixed(),
        ZERO_BIG_NUMBER.toFixed(),
      ],
    )

    const tx = await userProxy.execute(userActions.address, addCollateralEncoded, {
      gasLimit: 1_000_000,
    })
    console.log('adding collateral...', tx.hash)

    const receipt = await tx.wait()
    console.log('Collateral added!', { receipt })
  }

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
      <Form.Item>
        <Button htmlType="submit" type="primary">
          Deposit collateral
        </Button>
      </Form.Item>
    </Form>
  )
}
