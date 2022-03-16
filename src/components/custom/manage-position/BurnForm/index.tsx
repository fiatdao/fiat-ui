import BigNumber from 'bignumber.js'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { contracts } from '@/src/constants/contracts'
import { getHumanValue } from '@/src/web3/utils'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { WAD_DECIMALS } from '@/src/constants/misc'
import { Position } from '@/src/utils/data/positions'
import { Balance } from '@/src/components/custom/balance'

export type BurnFormFields = {
  burn: BigNumber
  withdraw: BigNumber
}

export const BurnForm = ({ position }: { position: Position }) => {
  // const [submitting, setSubmitting] = useState<boolean>(false)
  // const [form] = AntdForm.useForm<BurnFormFields>()
  // const summary = useBurnFormSummary(position, form.getFieldsValue())

  // const handleBurn = async ({ burn, withdraw }: BurnFormFields) => {
  //   try {
  //     const toWithdraw = withdraw ? getNonHumanValue(withdraw, WAD_DECIMALS) : ZERO_BIG_NUMBER
  //     const toBurn = burn ? getNonHumanValue(burn, WAD_DECIMALS) : ZERO_BIG_NUMBER
  //     setSubmitting(true)
  //
  //     if (!hasFiatAllowance) {
  //       await approveFiatAllowance()
  //     } else if (!hasMonetaAllowance) {
  //       await approveMonetaAllowance()
  //     } else {
  //       await burnFIAT({
  //         vault: position?.protocolAddress ?? '',
  //         token: position?.collateral.address ?? '',
  //         tokenId: 0,
  //         toWithdraw,
  //         toBurn,
  //       })
  //       await Promise.all([refetch(), updateFiat()])
  //       form.resetFields()
  //     }
  //   } catch (err) {
  //     console.log('Failed to burn FIAT', err)
  //   } finally {
  //     setSubmitting(false)
  //   }
  // }

  // const burnButtonText = !hasFiatAllowance
  //   ? 'Set allowance for Proxy'
  //   : !hasMonetaAllowance
  //   ? 'Enable Proxy for FIAT'
  //   : 'Repay Debt'

  return (
    <>
      <Balance
        title="Select amount to burn"
        value={`Available: ${Number(
          getHumanValue(position.totalNormalDebt, WAD_DECIMALS)?.toFixed(4),
        )}`}
      />
      <Form.Item name="burn" required>
        <TokenAmount
          displayDecimals={contracts.FIAT.decimals}
          healthFactorValue={0}
          max={Number(getHumanValue(position.totalNormalDebt, WAD_DECIMALS)?.toFixed(4))}
          maximumFractionDigits={contracts.FIAT.decimals}
          slider={'healthFactorVariantReverse'}
          tokenIcon={<FiatIcon />}
        />
      </Form.Item>
    </>
  )
}
