import BigNumber from 'bignumber.js'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { Balance } from '@/src/components/custom/balance'
import { useManagePositionForm } from '@/src/hooks/managePosition'
import { Position } from '@/src/utils/data/positions'
import { getHumanValue } from '@/src/web3/utils'
import { WAD_DECIMALS } from '@/src/constants/misc'

export type DepositFormFields = {
  deposit?: BigNumber
  fiatAmount?: BigNumber
}

export const DepositForm = ({ position }: { position: Position }) => {
  const { healthFactor, maxDepositValue, tokenInfo } = useManagePositionForm(
    position,
    undefined,
    undefined,
  )

  return (
    <>
      <Balance
        title="Select amount to deposit"
        value={`Available: ${tokenInfo?.humanValue?.toFixed(4)}`}
      />
      <Form.Item name="deposit" preserve={true} required>
        <TokenAmount
          displayDecimals={tokenInfo?.decimals}
          healthFactorValue={Number(getHumanValue(healthFactor, WAD_DECIMALS)?.toFixed(4))}
          mainAsset={position.protocol}
          max={Number(maxDepositValue?.toFixed(4))}
          maximumFractionDigits={tokenInfo?.decimals}
          secondaryAsset={position.underlier.symbol}
          slider={'healthFactorVariant'}
        />
      </Form.Item>
    </>
  )
}
