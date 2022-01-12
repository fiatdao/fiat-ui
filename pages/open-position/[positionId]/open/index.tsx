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
import { Chains } from '@/src/constants/chains'
import { useTokenSymbol } from '@/src/hooks/contracts/useTokenSymbol'
import genericSuspense from '@/src/utils/genericSuspense'
import { Form } from '@/src/components/antd'
import TokenAmount from '@/src/components/custom/token-amount'
import ElementIcon from '@/src/resources/svg/element.svg'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import UserActions from '@/src/abis/UserActions.json'
import useUserProxy from '@/src/hooks/useUserProxy'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { TestERC20 } from '@/types/typechain'

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

const USER_ACTIONS = {
  address: {
    [Chains.mainnet]: '',
    [Chains.goerli]: '0xBd43980D5632FA81Dd4597820Ce07E94A944C469',
  },
  abi: UserActions,
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
  const [balance, refetch] = useContractCall<
    TestERC20,
    'balanceOf',
    [string],
    Promise<ethers.BigNumber>
  >(tokenAddress, contracts.TEST_ERC20.abi, 'balanceOf', [currentUserAddress || DEFAULT_ADDRESS])

  const [tokenFormAmount, setTokenFormAmount] = useState(ZERO_BIG_NUMBER)
  const [fiatFormAmount, setFiatFormAMount] = useState(ZERO_BIG_NUMBER)

  const handleSubmit = async (args: FormProps) => {
    if (isAppConnected && web3Provider) {
      const token = args.tokenAmount
      const fiat = args.fiatAmount
      // TODO Hardcoded decimals
      const tokenAmount = getNonHumanValue(token, 6)
      const fiatAmount = getNonHumanValue(fiat, 18)

      const userActions = new Contract(
        USER_ACTIONS.address[Chains.goerli],
        USER_ACTIONS.abi,
        web3Provider.getSigner(),
      )

      const erc20 = new Contract(tokenAddress, contracts.TEST_ERC20.abi, web3Provider.getSigner())

      if (userProxy) {
        const allowance = await erc20.allowance(currentUserAddress, userProxy.address)

        if (allowance.lt(tokenAmount.toFixed())) {
          const approve = await (
            await erc20.approve(userProxy.address, ethers.constants.MaxUint256)
          ).wait()

          if (!approve) {
            console.log('approve failed')
          }
        }
      }

      const encodedFunctionData = userActions.interface.encodeFunctionData(
        'addCollateralAndIncreaseDebt',
        [VAULT_ADDRESS, tokenAddress as string, tokenAmount.toFixed(), fiatAmount.toFixed()],
      )

      const tx = await userProxy?.execute(userActions.address, encodedFunctionData, {
        gasLimit: 10000000,
      })

      console.log('Creating position...', tx.hash)
      const receipt = await tx.wait()
      console.log('Position created!')
      console.log({ args, receipt })
    }
  }

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
            <div className="content-body">
              <div className="content-body-item">
                <div className="content-body-item-title">
                  <h4>Deposit {tokenSymbol}</h4>
                  <p>Current value: {value}</p>
                </div>
                {!isProxyAvailable && (
                  <div className="content-body-item-body">
                    <Button onClick={setupProxy}>Setup Proxy</Button>
                  </div>
                )}
                <OpenPositionSummary
                  currentCollateralValue={0}
                  newFIATDebt={0}
                  outstandingFIATDebt={0}
                  stabilityFee={0}
                />
              </div>
            </div>
            <Form.Item>
              <Button htmlType="submit" type="primary">
                Submit
              </Button>
            </Form.Item>
          </Form>
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
