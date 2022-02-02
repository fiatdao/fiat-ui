import { Button } from 'antd'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { KeyedMutator } from 'swr'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { Chains } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { useBurnForm } from '@/src/hooks/managePosition'
import { iconByAddress } from '@/src/utils/managePosition'
import { Position } from '@/src/utils/your-positions-api'
import { getNonHumanValue } from '@/src/web3/utils'

export const BurnForm = ({
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
  const { fiatInfo, userActions, userProxy } = useBurnForm()
  const [form] = AntdForm.useForm()

  const handleBurn = async ({ burn }: { burn: BigNumber }) => {
    if (!fiatInfo || !userProxy) {
      return
    }

    const toBurn = getNonHumanValue(burn, contracts.FIAT.decimals)

    if (fiatInfo.allowance.lt(toBurn.toFixed())) {
      await fiatInfo.approve()
    }

    const burnDebtEncoded = userActions.interface.encodeFunctionData('decreaseDebt', [
      vaultAddress,
      tokenAddress,
      toBurn.toFixed(),
    ])

    const tx = await userProxy.execute(userActions.address, burnDebtEncoded, {
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
