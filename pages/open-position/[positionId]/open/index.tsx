import { Contract } from '@ethersproject/contracts'
import { Button } from 'antd'
import AntdForm from 'antd/lib/form'
import { ethers } from 'ethers'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import BigNumber from 'bignumber.js'
import { contracts } from '@/src/constants/contracts'
import { DEFAULT_ADDRESS, ZERO_BIG_NUMBER, getHumanValue, getNonHumanValue } from '@/src/web3/utils'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { useTokenSymbol } from '@/src/hooks/contracts/useTokenSymbol'
import genericSuspense from '@/src/utils/genericSuspense'
import { Form } from '@/src/components/antd'
import TokenAmount from '@/src/components/custom/token-amount'
import ElementIcon from '@/src/resources/svg/element.svg'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import useUserProxy from '@/src/hooks/useUserProxy'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { TestERC20 } from '@/types/typechain'
import { useUserActions } from '@/src/hooks/useUserActions'
import { useERC20Allowance } from '@/src/hooks/useERC20Allowance'

const StepperTitle: React.FC<{
  title: string
  subtitle: string
  currentStep: number
  totalSteps: number
}> = ({ currentStep, subtitle, title, totalSteps }) => (
  <div className="content-title">
    <h2>{title}</h2>
    <p className="steps">
      <span className="current-step">{currentStep}</span>/{totalSteps}
    </p>
    <h3>{subtitle}</h3>
  </div>
)

const OpenPositionSummary: React.FC<{
  currentCollateralValue: number
  outstandingFIATDebt: number
  newFIATDebt: number
  stabilityFee: number
}> = ({ currentCollateralValue, newFIATDebt, outstandingFIATDebt, stabilityFee }) => {
  return (
    <div className="content-summary">
      <div className="content-summary-title">Current collateral value</div>
      <div className="content-summary-value">{currentCollateralValue}</div>
      <div className="content-summary-title">Outstanding FIAT debt</div>
      <div className="content-summary-value">{outstandingFIATDebt}</div>
      <div className="content-summary-title">New FIAT debt</div>
      <div className="content-summary-value">{newFIATDebt}</div>
      <div className="content-summary-title">Stability fee</div>
      <div className="content-summary-value">{stabilityFee}</div>
    </div>
  )
}

const FormERC721: React.FC<{ tokenSymbol: string; value: string }> = ({ tokenSymbol, value }) => {
  const showModal = () => {
    console.log('showModal')
  }

  return (
    <>
      <div className="container">
        <div className="container">
          <StepperTitle
            currentStep={1}
            subtitle="Select which asset to deposit and how much FIAT to mint."
            title="Configure your position"
            totalSteps={7}
          />
          <div className="content-body">
            <div className="content-body-item">
              <div className="content-body-item-title">
                <h4>Deposit {tokenSymbol}</h4>
                <p>Current value: {value}</p>
              </div>
              <div className="content-body-item-body">
                {/* TODO: should this modal behave as a 'select' input? */}
                <Button onClick={showModal}>Select from wallet</Button>
                {/* TODO: verify that the user does not have a proxy already */}
                <Button disabled>Setup Proxy</Button>
              </div>
              ja
              <OpenPositionSummary
                currentCollateralValue={0}
                newFIATDebt={0}
                outstandingFIATDebt={0}
                stabilityFee={0}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const VAULT_ADDRESS = '0xeCdB7DC331a8b5117eCF548Fa4730b0dAe76077D'

type FormProps = { tokenAmount: BigNumber; fiatAmount: BigNumber }

const FormERC20: React.FC<{ tokenSymbol: string; tokenAddress: string; value: string }> = ({
  tokenAddress,
  tokenSymbol,
  value,
}) => {
  const [form] = AntdForm.useForm<FormProps>()

  const { address: currentUserAddress, isAppConnected, web3Provider } = useWeb3Connection()
  const { isProxyAvailable, setupProxy, userProxy } = useUserProxy()
  const { allowance, approve, hasAllowance, loadingApprove } = useERC20Allowance(
    tokenAddress,
    userProxy?.address || '',
  )

  console.log({ allowance, approve, loadingApprove })

  const userActions = useUserActions()
  const [balance, refetch] = useContractCall<
    TestERC20,
    'balanceOf',
    [string],
    Promise<ethers.BigNumber>
  >(tokenAddress, contracts.TEST_ERC20.abi, 'balanceOf', [currentUserAddress || DEFAULT_ADDRESS])

  const [tokenFormAmount, setTokenFormAmount] = useState(ZERO_BIG_NUMBER)

  const handleSubmit = async (args: FormProps) => {
    if (isAppConnected && web3Provider) {
      // TODO Hardcoded decimals
      const tokenAmount = getNonHumanValue(args.tokenAmount, contracts.TEST_ERC20.decimals)
      const fiatAmount = getNonHumanValue(args.fiatAmount, contracts.FIAT.decimals)

      if (allowance.lt(tokenAmount.toString())) {
        await approve()
      }

      // TODO Extract logic to be agnostic of protocol used (vault). addCollateral('element', token, amount, fiat)
      const encodedFunctionData = userActions.interface.encodeFunctionData(
        'addCollateralAndIncreaseDebt',
        [VAULT_ADDRESS, tokenAddress, tokenAmount.toFixed(), fiatAmount.toFixed()],
      )

      const tx = await userProxy?.execute(userActions.address, encodedFunctionData, {
        gasLimit: 10000000,
      })

      console.log('Creating position...', tx.hash)
      const receipt = await tx.wait()
      refetch()
      console.log('Position created!')
      console.log({ args, receipt })
    }
  }

  // Setup Proxy :tick
  // Allowance loading:tick
  // Deposit :loading
  return (
    <>
      <div className="container">
        <div className="content">
          <StepperTitle
            currentStep={1}
            subtitle="Select which asset to deposit and how much FIAT to mint."
            title="Configure your position"
            totalSteps={7}
          />
          <div className="content-body">
            <div className="content-body-item">
              <div className="content-body-item-title">
                <h4>Deposit {tokenSymbol}</h4>
                <p>Current value: {value}</p>
              </div>
              <Form
                form={form}
                initialValues={{ amount: undefined }}
                onFinish={handleSubmit}
                validateTrigger={['onSubmit']}
              >
                <Form.Item name="tokenAmount" required>
                  <TokenAmount
                    disabled={false}
                    displayDecimals={4}
                    max={balance ? getHumanValue(BigNumber.from(balance.toString()), 6) : 0}
                    maximumFractionDigits={6}
                    onChange={(val) => val && setTokenFormAmount(val)}
                    slider
                    tokenIcon={<ElementIcon />}
                  />
                </Form.Item>
                {!isProxyAvailable && (
                  <div className="content-body-item-body">
                    <Button onClick={setupProxy}>Setup Proxy</Button>
                  </div>
                )}
                {!isProxyAvailable && (
                  <div className="content-body-item-body">
                    <Button disabled={hasAllowance} onClick={approve}>
                      {loadingApprove ? 'loading' : 'Approve'}
                    </Button>
                  </div>
                )}

                <Form.Item dependencies={['tokenAmount']} name="fiatAmount" required>
                  <TokenAmount
                    disabled={false}
                    displayDecimals={4}
                    max={tokenFormAmount}
                    maximumFractionDigits={6}
                    slider
                    tokenIcon={<FiatIcon />}
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    disabled={!hasAllowance || !isProxyAvailable}
                    htmlType="submit"
                    type="primary"
                  >
                    Submit
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </div>

          <OpenPositionSummary
            currentCollateralValue={0}
            newFIATDebt={0}
            outstandingFIATDebt={0}
            stabilityFee={0}
          />
        </div>
      </div>
    </>
  )
}

const OpenPosition = () => {
  const {
    query: { positionId: tokenAddress },
  } = useRouter()
  const { tokenSymbol } = useTokenSymbol(tokenAddress as string)

  return (
    <>
      {/* TODO: implement dynamic titles */}
      {/*<Header title={`Open ${tokenSymbol} position`} />*/}
      <Link href="/open-position" passHref>
        <Button>Back</Button>
      </Link>
      <h1>Open: {tokenAddress}</h1>
      <FormERC20 tokenAddress={tokenAddress as string} tokenSymbol={tokenSymbol} value="$5,000" />
    </>
  )
}

export default genericSuspense(OpenPosition)
