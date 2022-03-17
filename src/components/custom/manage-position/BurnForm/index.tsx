import BigNumber from 'bignumber.js'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { contracts } from '@/src/constants/contracts'
import { getHumanValue } from '@/src/web3/utils'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { WAD_DECIMALS } from '@/src/constants/misc'
import { Position } from '@/src/utils/data/positions'
import { Balance } from '@/src/components/custom/balance'
import { useManagePositionForm } from '@/src/hooks/managePosition'

export type BurnFormFields = {
  burn: BigNumber
  withdraw: BigNumber
}

export const BurnForm = ({ position }: { position: Position }) => {
  const { healthFactor, maxBurnValue } = useManagePositionForm(position, undefined)

  return (
    <>
      <Balance
        title="Select amount to burn"
        value={`Available: ${Number(
          getHumanValue(maxBurnValue, WAD_DECIMALS).toFixed(4, BigNumber.ROUND_FLOOR),
        )}`}
      />
      <Form.Item name="burn" preserve={true} required>
        <TokenAmount
          displayDecimals={contracts.FIAT.decimals}
          healthFactorValue={Number(getHumanValue(healthFactor, WAD_DECIMALS)?.toFixed(4))}
          max={Number(getHumanValue(maxBurnValue, WAD_DECIMALS).toFixed(4, BigNumber.ROUND_FLOOR))}
          maximumFractionDigits={contracts.FIAT.decimals}
          slider={'healthFactorVariantReverse'}
          tokenIcon={<FiatIcon />}
        />
      </Form.Item>
    </>
  )
}
