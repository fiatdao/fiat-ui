import s from './s.module.scss'
import cn from 'classnames'
import AntdForm from 'antd/lib/form'
import BigNumber from 'bignumber.js'
import { useState } from 'react'
import { ZERO_ADDRESS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { Form } from '@/src/components/antd'
import { TokenAmount } from '@/src/components/custom'
import { Chains } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { useMintForm } from '@/src/hooks/managePosition'
import { iconByAddress } from '@/src/utils/managePosition'
import { getNonHumanValue } from '@/src/web3/utils'
import { RefetchPositionById } from '@/src/hooks/subgraph/usePosition'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { SummaryItem } from '@/src/components/custom/summary'

export const MintForm = ({
  vaultAddress,
}: {
  refetch: RefetchPositionById
  userBalance?: BigNumber
  vaultAddress?: string
}) => {
  const [submitting, setSubmitting] = useState<boolean>(false)
  const { address, fiatInfo, userActions, userProxy } = useMintForm()
  const [form] = AntdForm.useForm()

  const handleMint = async ({ mint }: { mint: BigNumber }) => {
    if (!userProxy || !address) {
      return
    }

    const toMint = getNonHumanValue(mint, contracts.FIAT.decimals)

    const increaseDebtEncoded = userActions.interface.encodeFunctionData(
      'modifyCollateralAndDebt',
      [
        vaultAddress!,
        ZERO_ADDRESS,
        0,
        ZERO_ADDRESS,
        address,
        ZERO_BIG_NUMBER.toFixed(),
        toMint.toFixed(),
      ],
    )
    setSubmitting(true)
    try {
      const tx = await userProxy.execute(userActions.address, increaseDebtEncoded, {
        gasLimit: 1_000_000,
      })
      await tx.wait()
    } catch (err) {
      console.log(err)
    } finally {
      setSubmitting(submitting)
    }
    // @TODO: does not make sense to refetch because graph takes some time to update
    //        we could add a notification to tell the user that update will take some time
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

  return (
    <Form form={form} onFinish={handleMint}>
      <fieldset disabled={submitting}>
        <Form.Item name="mint" required>
          <TokenAmount
            disabled={submitting}
            displayDecimals={fiatInfo?.decimals}
            max={fiatInfo?.humanValue}
            maximumFractionDigits={fiatInfo?.decimals}
            slider
            tokenIcon={iconByAddress[contracts.FIAT.address[Chains.goerli]]}
          />
        </Form.Item>
        <ButtonGradient height="lg" htmlType="submit" loading={submitting}>
          Mint
        </ButtonGradient>
        <div className={cn(s.summary)}>
          {mockedData.map((item, index) => (
            <SummaryItem key={index} title={item.title} value={item.value} />
          ))}
        </div>
      </fieldset>
    </Form>
  )
}
