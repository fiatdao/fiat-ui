import BigNumber from 'bignumber.js'
import { Balance } from '@/src/components/custom/balance'
import { WAD_DECIMALS } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { getHumanValue } from '@/src/web3/utils'
import { Position } from '@/src/utils/data/positions'
import { useManagePositionForm } from '@/src/hooks/managePosition'

export const WithdrawForm = ({ position }: { position: Position }) => {
  const { maxWithdrawValue } = useManagePositionForm(position as Position)

  // const [submitting, setSubmitting] = useState<boolean>(false)
  //
  // const { withdraw: withdrawCollateral } = useWithdrawForm({
  //   tokenAddress: position.collateral.address,
  // })
  // const [form] = AntdForm.useForm<WithdrawFormFields>()
  //
  // const handleWithdraw = async ({ withdraw }: WithdrawFormFields) => {
  //   try {
  //     const toWithdraw = withdraw ? getNonHumanValue(withdraw, 18) : ZERO_BIG_NUMBER
  //     setSubmitting(true)
  //     await withdrawCollateral({
  //       vault: position.protocolAddress,
  //       token: position.collateral.address,
  //       tokenId: 0, // TODO: depends on the protocol
  //       toWithdraw,
  //     })
  //   } catch (err) {
  //     console.error('Failed to withdraw', err)
  //   } finally {
  //     setSubmitting(false)
  //     await refetch()
  //     form.resetFields()
  //   }
  // }
  //
  // const normalDebtWithColRatio = position.totalNormalDebt.times(
  //   position.vaultCollateralizationRatio || 1,
  // )
  //
  // //collateralDeposited - fiatDebt*collateralizationRatio/collateralValue
  // const newMaxWithdrawAmount = position.totalCollateral.minus(
  //   normalDebtWithColRatio.div(position.collateralValue),
  // )

  return (
    <>
      <Balance
        title="Select amount to withdraw"
        value={`Available: ${getHumanValue(maxWithdrawValue, WAD_DECIMALS).toFixed(
          4,
          BigNumber.ROUND_FLOOR,
        )}`}
      />
      <Form.Item name="withdraw" required>
        <TokenAmount
          displayDecimals={4}
          healthFactorValue={0}
          mainAsset={position.protocol}
          max={Number(
            getHumanValue(maxWithdrawValue, WAD_DECIMALS).toFixed(4, BigNumber.ROUND_FLOOR),
          )}
          maximumFractionDigits={6}
          secondaryAsset={position.underlier.symbol}
          slider={'healthFactorVariantReverse'}
        />
      </Form.Item>
    </>
  )
}
