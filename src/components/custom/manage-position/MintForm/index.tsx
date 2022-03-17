import BigNumber from 'bignumber.js'
import { Balance } from '@/src/components/custom/balance'
import { WAD_DECIMALS } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { contracts } from '@/src/constants/contracts'
import { getHumanValue } from '@/src/web3/utils'
import { Position } from '@/src/utils/data/positions'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { useManagePositionForm } from '@/src/hooks/managePosition'

export const MintForm = ({ position }: { position: Position }) => {
  const { healthFactor, maxMintValue } = useManagePositionForm(position)

  return (
    <>
      <Balance
        title="Select amount to mint"
        value={`Available: ${getHumanValue(maxMintValue, WAD_DECIMALS).toFixed(
          4,
          BigNumber.ROUND_FLOOR,
        )}`}
      />
      <Form.Item name="mint" required>
        <TokenAmount
          displayDecimals={contracts.FIAT.decimals}
          healthFactorValue={Number(getHumanValue(healthFactor, WAD_DECIMALS)?.toFixed(4))}
          max={Number(getHumanValue(maxMintValue, WAD_DECIMALS)?.toFixed(4))}
          maximumFractionDigits={contracts.FIAT.decimals}
          slider={'healthFactorVariant'}
          tokenIcon={<FiatIcon />}
        />
      </Form.Item>
    </>
  )
}
