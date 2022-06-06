import { useMemo, useState }                       from 'react'
import s                                           from './s.module.scss'
import cn                                          from 'classnames'

import { FormExtraAction }                         from '@/src/components/custom/form-extra-action'
import { Form }                                    from '@/src/components/antd'
import TokenAmount                                 from '@/src/components/custom/token-amount'
import { Balance }                                 from '@/src/components/custom/balance'
import { ButtonExtraFormAction }                   from '@/src/components/custom/button-extra-form-action'

import { ONE_BIG_NUMBER, ZERO_BIG_NUMBER }         from '@/src/constants/misc'
import { getHumanValue }                           from '@/src/web3/utils'
import { WAD_DECIMALS, VIRTUAL_RATE_MAX_SLIPPAGE } from '@/src/constants/misc'
import FiatIcon                                    from '@/src/resources/svg/fiat-icon.svg'
import { useFIATBalance }                          from '@/src/hooks/useFIATBalance'
import BigNumber                                   from 'bignumber.js'


type Props = {
  loading: boolean
  healthFactorNumber: any
  activeMachine: any
  collateral: any
  send: (sendInfo: any) => void
  marketRate?: BigNumber //only applicable for underlying flow
}

export const MintFiat: React.FC<Props> = ({
  loading,
  healthFactorNumber,
  activeMachine,
  collateral,
  send,
  marketRate

}) => {
  const [FIATBalance] = useFIATBalance(true)
  const [mintFiat, setMintFiat] = useState(false)

  // @TODO: not working max amount
  // maxFIAT = totalCollateral*collateralValue/collateralizationRatio/(virtualRateSafetyMargin*virtualRate)-debt
  const maxBorrowAmountCalculated = useMemo(() => {
    const totalCollateral = marketRate ? 
      marketRate.times(activeMachine.context.underlierAmount) :
      activeMachine.context.erc20Amount ?? ZERO_BIG_NUMBER
    const collateralValue = getHumanValue(collateral.currentValue || ONE_BIG_NUMBER, WAD_DECIMALS)
    const collateralizationRatio = getHumanValue(
      collateral.vault.collateralizationRatio || ONE_BIG_NUMBER,
      WAD_DECIMALS,
    )

    const virtualRateWithMargin = VIRTUAL_RATE_MAX_SLIPPAGE.times(collateral.vault.virtualRate)
    const maxBorrowAmount = totalCollateral
      .times(collateralValue)
      .div(collateralizationRatio)
      .div(virtualRateWithMargin)

    return maxBorrowAmount
  }, [activeMachine, collateral, marketRate])

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
                onChange={(val) =>
                  val && send({ type: 'SET_FIAT_AMOUNT', fiatAmount: val })
                }
                slider="healthFactorVariant"
                tokenIcon={<FiatIcon />}
              />
            </Form.Item>
          }
          buttonText="Mint FIAT with this transaction"
          disabled={loading}
          onClick={() => setMintFiat(!mintFiat)}
          top={
            <Balance
              title={`Mint FIAT`}
              value={`Balance: ${FIATBalance.toFixed(4)}`}
            />
          }
        />
      ) : (
        <ButtonExtraFormAction onClick={() => setMintFiat(!mintFiat)}>
          Mint FIAT with this transaction
        </ButtonExtraFormAction>
      )}
    </div>
  )
}