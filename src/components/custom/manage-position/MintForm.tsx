import { Button } from 'antd'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { KeyedMutator } from 'swr'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { Chains } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { useMintForm } from '@/src/hooks/managePosition'
import { iconByAddress } from '@/src/utils/managePosition'
import { getNonHumanValue } from '@/src/web3/utils'
import { Position } from '@/src/hooks/subgraph'

export const MintForm = ({
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
  const { userActions, userProxy } = useMintForm({ vaultAddress })
  const [form] = AntdForm.useForm()

  const handleMint = async ({ mint }: { mint: BigNumber }) => {
    if (!userProxy) {
      return
    }

    const toMint = getNonHumanValue(mint, contracts.FIAT.decimals)

    const increaseDebtEncoded = userActions.interface.encodeFunctionData('increaseDebt', [
      vaultAddress,
      tokenAddress,
      toMint.toFixed(),
    ])

    const tx = await userProxy.execute(userActions.address, increaseDebtEncoded, {
      gasLimit: 1_000_000,
    })
    console.log('minting...', tx.hash)

    const receipt = await tx.wait()
    console.log('Debt (FIAT) minted', { receipt })

    refetch()
  }

  return (
    <Form form={form} onFinish={handleMint}>
      <Form.Item name="mint" required>
        <TokenAmount
          disabled={false}
          displayDecimals={contracts.FIAT.decimals}
          max={userBalance}
          maximumFractionDigits={contracts.FIAT.decimals}
          slider
          tokenIcon={iconByAddress[contracts.FIAT.address[Chains.goerli]]}
        />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary">
          Mint FIAT
        </Button>
      </Form.Item>
    </Form>
  )
}
