import { Button } from 'antd'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { ZERO_ADDRESS, ZERO_BN } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { Chains } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { useBurnForm } from '@/src/hooks/managePosition'
import { iconByAddress } from '@/src/utils/managePosition'
import { getNonHumanValue } from '@/src/web3/utils'
import { RefetchPositionById } from '@/src/hooks/subgraph/usePosition'

export const BurnForm = ({
  refetch,
  userBalance,
  vaultAddress,
}: {
  refetch: RefetchPositionById
  userBalance?: number
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
      [vaultAddress, ZERO_ADDRESS, ZERO_ADDRESS, address, ZERO_BN, toBurn.times(-1).toFixed()],
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
      <Form.Item>
        <Button htmlType="submit" type="primary">
          Burn FIAT
        </Button>
      </Form.Item>
    </Form>
  )
}
