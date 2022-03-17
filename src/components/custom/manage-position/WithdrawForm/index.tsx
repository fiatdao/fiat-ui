import BigNumber from 'bignumber.js'
import { Balance } from '@/src/components/custom/balance'
import { WAD_DECIMALS } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { getHumanValue } from '@/src/web3/utils'
import { Position } from '@/src/utils/data/positions'
import { useManagePositionForm } from '@/src/hooks/managePosition'

export const WithdrawForm = ({ position }: { position: Position }) => {
  const { healthFactor, maxWithdrawValue } = useManagePositionForm(position as Position)

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
          healthFactorValue={Number(getHumanValue(healthFactor, WAD_DECIMALS)?.toFixed(4))}
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
