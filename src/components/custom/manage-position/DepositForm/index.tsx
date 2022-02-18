import s from './s.module.scss'
import cn from 'classnames'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { useState } from 'react'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { useDepositForm } from '@/src/hooks/managePosition'
import { iconByAddress } from '@/src/utils/managePosition'
import { getNonHumanValue } from '@/src/web3/utils'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { SummaryItem } from '@/src/components/custom/summary'
import { ButtonsWrapper } from '@/src/components/custom/buttons-wrapper'
import { ButtonExtraFormAction } from '@/src/components/custom/button-extra-form-action'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { Balance } from '@/src/components/custom/balance'
import { FormExtraAction } from '@/src/components/custom/form-extra-action'

type HandleDepositForm = {
  deposit: BigNumber
  fiatAmount: BigNumber
}

export const DepositForm = ({
  tokenAddress,
  vaultAddress,
}: {
  tokenAddress: string
  vaultAddress: string
}) => {
  const [submiting, setSubmiting] = useState<boolean>(false)
  const { address, fiatInfo, tokenInfo, userActions, userProxy } = useDepositForm({ tokenAddress })
  const [form] = AntdForm.useForm()

  const handleDeposit = async ({ deposit, fiatAmount }: HandleDepositForm) => {
    if (!tokenInfo || !userProxy || !address) {
      return
    }

    const toDeposit = deposit ? getNonHumanValue(deposit, 18) : ZERO_BIG_NUMBER
    const toFiatAmount = fiatAmount ? getNonHumanValue(fiatAmount, 18) : ZERO_BIG_NUMBER

    const addCollateralEncoded = userActions.interface.encodeFunctionData(
      'modifyCollateralAndDebt',
      [
        vaultAddress,
        tokenAddress,
        0, // TODO: tokenID = 0 only for Element(ERC20)
        address, // userProxy
        address, // userProxy
        toDeposit.toFixed(),
        toFiatAmount.toFixed(),
      ],
    )
    setSubmiting(true)
    try {
      const tx = await userProxy.execute(userActions.address, addCollateralEncoded, {
        gasLimit: 1_000_000,
      })
      await tx.wait()
      setSubmiting(false)
    } catch (err) {
      setSubmiting(false)
    }
  }

  const mockedData = [
    {
      title: 'Current collateral value',
      value: '$5,000',
    },
    {
      title: 'Outstanding FIAT debt',
      value: '0',
    },
    {
      title: 'New FIAT debt',
      value: '0',
    },
    {
      title: 'Stability feed',
      value: '0',
    },
  ]

  const [mintFiat, setMintFiat] = useState(false)
  const toggleMintFiat = () => setMintFiat(!mintFiat)
  const mintButtonText = 'Mint fiat with this transaction'

  return (
    <Form form={form} onFinish={handleDeposit}>
      <fieldset disabled={submiting}>
        <Form.Item name="deposit" required>
          <TokenAmount
            disabled={submiting}
            displayDecimals={tokenInfo?.decimals}
            max={tokenInfo?.humanValue}
            maximumFractionDigits={tokenInfo?.decimals}
            slider
            tokenIcon={iconByAddress[tokenAddress]}
          />
        </Form.Item>
        {mintFiat && (
          <FormExtraAction
            bottom={
              <Form.Item name="fiatAmount" required style={{ marginBottom: 0 }}>
                <TokenAmount
                  disabled={submiting}
                  displayDecimals={fiatInfo.decimals}
                  max={fiatInfo.humanValue}
                  maximumFractionDigits={fiatInfo.decimals}
                  slider
                  tokenIcon={<FiatIcon />}
                />
              </Form.Item>
            }
            buttonText={mintButtonText}
            onClick={toggleMintFiat}
            top={<Balance title="Mint FIAT" value={`Available: ${fiatInfo.humanValue}`} />}
          />
        )}
        <ButtonsWrapper>
          {!mintFiat && (
            <ButtonExtraFormAction onClick={() => toggleMintFiat()}>
              {mintButtonText}
            </ButtonExtraFormAction>
          )}
          <ButtonGradient height="lg" htmlType="submit" loading={submiting}>
            Deposit
          </ButtonGradient>
        </ButtonsWrapper>
        <div className={cn(s.summary)}>
          {mockedData.map((item, index) => (
            <SummaryItem key={index} title={item.title} value={item.value} />
          ))}
        </div>
      </fieldset>
    </Form>
  )
}
