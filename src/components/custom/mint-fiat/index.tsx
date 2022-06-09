import s from './s.module.scss'
import { Form } from '@/src/components/antd'
import { Balance } from '@/src/components/custom/balance'
import { ButtonExtraFormAction } from '@/src/components/custom/button-extra-form-action'
import { FormExtraAction } from '@/src/components/custom/form-extra-action'
import TokenAmount from '@/src/components/custom/token-amount'
import { ONE_BIG_NUMBER, WAD_DECIMALS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { useFIATBalance } from '@/src/hooks/useFIATBalance'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { calculateMaxBorrow } from '@/src/utils/data/positions'
import BigNumber from 'bignumber.js'
import cn from 'classnames'
import { useMemo, useState } from 'react'

type Props = {
  loading: boolean
  healthFactorNumber: any
  activeMachine: any
  collateral: any
  send: (sendInfo: any) => void
  marketRate?: BigNumber //only applicable for underlying flow
}

export const MintFiat: React.FC<Props> = ({
  activeMachine,
  collateral,
  healthFactorNumber,
  loading,
  /* marketRate, */
  send,
}) => {
  const [FIATBalance] = useFIATBalance(true)
  const [mintFiat, setMintFiat] = useState(false)

  const maxBorrowAmountCalculated = useMemo((): BigNumber => {
    const totalCollateralScaled =
      activeMachine.context.erc20Amount.scaleBy(WAD_DECIMALS) ?? ZERO_BIG_NUMBER
    const collateralValue = collateral.currentValue || ONE_BIG_NUMBER
    const collateralizationRatio = collateral.vault.collateralizationRatio || ONE_BIG_NUMBER
    const maxBorrowAmount = calculateMaxBorrow(
      totalCollateralScaled,
      collateralValue,
      collateralizationRatio,
      ZERO_BIG_NUMBER, // no existing debt, this is a new loan
    )
    return maxBorrowAmount
  }, [activeMachine.context.erc20Amount, collateral])

  return (
    <div className={cn(s.mintFiat)}>
      {!mintFiat ? (
        <FormExtraAction
          bottom={
            <Form.Item name="fiatAmount" required style={{ marginBottom: 0 }}>
              <TokenAmount
                disabled={loading}
                displayDecimals={4}
                healthFactorValue={healthFactorNumber}
                max={maxBorrowAmountCalculated}
                maximumFractionDigits={6}
                onChange={(val) => val && send({ type: 'SET_FIAT_AMOUNT', fiatAmount: val })}
                slider="healthFactorVariant"
                tokenIcon={<FiatIcon />}
              />
            </Form.Item>
          }
          buttonText="Mint FIAT with this transaction"
          disabled={loading}
          onClick={() => setMintFiat(!mintFiat)}
          top={<Balance title={`Mint FIAT`} value={`Balance: ${FIATBalance.toFixed(4)}`} />}
        />
      ) : (
        <ButtonExtraFormAction onClick={() => setMintFiat(!mintFiat)}>
          Mint FIAT with this transaction
        </ButtonExtraFormAction>
      )}
    </div>
  )
}
