import BigNumber from 'bignumber.js'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { Balance } from '@/src/components/custom/balance'
import { useManagePositionForm } from '@/src/hooks/managePosition'
import { Position } from '@/src/utils/data/positions'

// const DEFAULT_HEALTH_FACTOR = ''
// const MINT_BUTTON_TEXT = 'Mint fiat with this transaction'

export type DepositFormFields = {
  deposit?: BigNumber
  fiatAmount?: BigNumber
}

export const DepositForm = ({ position }: { position: Position }) => {
  const { healthFactor, tokenInfo } = useManagePositionForm(position)

  // const handleDeposit = async ({ deposit, fiatAmount }: DepositFormFields) => {
  //   try {
  //     const toDeposit = deposit ? getNonHumanValue(deposit, 18) : ZERO_BIG_NUMBER
  //     const toMint = fiatAmount ? getNonHumanValue(fiatAmount, 18) : ZERO_BIG_NUMBER
  //     setSubmitting(true)
  //     await depositCollateral({
  //       vault: position.protocolAddress,
  //       token: position.collateral.address,
  //       tokenId: 0,
  //       toDeposit,
  //       toMint,
  //     })
  //   } catch (err) {
  //     console.error('Failed to Deposit', err)
  //   } finally {
  //     setSubmitting(false)
  //     toggleMintFiat()
  //     calculateAndSetMaxFiat(ZERO_BIG_NUMBER)
  //     form.resetFields()
  //   }
  // }

  // const handleValuesChange = (...args: any[]) => {
  //   const [modifiedField, formFields] = args
  //   if (modifiedField.deposit) {
  //     calculateAndSetMaxFiat(modifiedField.deposit)
  //   }
  //
  //   // when any value is updated, and fiatAmount is other than `undefined`
  //   if (formFields.fiatAmount) {
  //     // this way we ensure the 'healthFactor' is re-calculated when `fiatAmount` is updated
  //     setHealthFactor(
  //       currentValue
  //         .times(position.totalCollateral.unscaleBy(WAD_DECIMALS).plus(args[1].deposit))
  //         .div(position.totalNormalDebt.unscaleBy(WAD_DECIMALS).plus(args[1].fiatAmount))
  //         .unscaleBy(18)
  //         .toFixed(2),
  //     )
  //   }
  //
  //   return args

  return (
    <>
      <Balance
        title="Select amount to deposit"
        value={`Available: ${tokenInfo?.humanValue?.toFixed(4)}`}
      />
      <Form.Item name="deposit" required>
        <TokenAmount
          displayDecimals={tokenInfo?.decimals}
          healthFactorValue={healthFactor}
          mainAsset={position.protocol}
          max={Number(tokenInfo?.humanValue?.toFixed(4))}
          maximumFractionDigits={tokenInfo?.decimals}
          secondaryAsset={position.underlier.symbol}
          slider={'healthFactorVariant'}
        />
      </Form.Item>
    </>
  )
}
