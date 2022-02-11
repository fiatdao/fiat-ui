import { Button } from 'antd'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { ZERO_ADDRESS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { Chains } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { useMintForm } from '@/src/hooks/managePosition'
import { iconByAddress } from '@/src/utils/managePosition'
import { getNonHumanValue } from '@/src/web3/utils'
import { RefetchPositionById } from '@/src/hooks/subgraph/usePosition'

export const MintForm = ({
  refetch,
  userBalance,
  vaultAddress,
}: {
  refetch: RefetchPositionById
  userBalance?: BigNumber
  vaultAddress: string
}) => {
  const { address, userActions, userProxy } = useMintForm({ vaultAddress })
  const [form] = AntdForm.useForm()

  const handleMint = async ({ mint }: { mint: BigNumber }) => {
    if (!userProxy || !address) {
      return
    }

    const toMint = getNonHumanValue(mint, contracts.FIAT.decimals)

    const increaseDebtEncoded = userActions.interface.encodeFunctionData(
      'modifyCollateralAndDebt',
      [
        vaultAddress,
        ZERO_ADDRESS,
        ZERO_ADDRESS,
        address,
        ZERO_BIG_NUMBER.toFixed(),
        toMint.toFixed(),
      ],
    )

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
