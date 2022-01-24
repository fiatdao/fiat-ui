import s from 'pages/open-position/[collateralId]/open/s.module.scss'
import { Button } from 'antd'
import AntdForm from 'antd/lib/form'
import { ethers } from 'ethers'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { contracts } from '@/src/constants/contracts'
import { DEFAULT_ADDRESS, ZERO_BIG_NUMBER, getHumanValue, getNonHumanValue } from '@/src/web3/utils'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { useTokenSymbol } from '@/src/hooks/contracts/useTokenSymbol'
import genericSuspense from '@/src/utils/genericSuspense'
import { Form } from '@/src/components/antd'
import { Grid, TokenAmount } from '@/src/components/custom'
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
  <Grid className={s.header} flow="row" gap={16} rowsTemplate="auto">
    <Grid align="center" colsTemplate="auto 1fr" flow="col">
      <h2>{title}</h2>
      <p className={s.steps}>
        <span className={s.currentStep}>{currentStep}</span>/{totalSteps}
      </p>
    </Grid>

    <p>{subtitle}</p>
  </Grid>
)

const OpenPositionSummary: React.FC<{
  currentCollateralValue: number
  outstandingFIATDebt: number
  newFIATDebt: number
  stabilityFee: number
}> = ({ currentCollateralValue, newFIATDebt, outstandingFIATDebt, stabilityFee }) => {
  return (
    <Grid className={s.summary} flow="row" gap={8}>
      <Grid colsTemplate="auto auto" flow="col">
        <div className={s.summaryTitle}>Current collateral value</div>
        <div className={s.summaryValue}>{currentCollateralValue}</div>
      </Grid>
      <Grid colsTemplate="auto auto" flow="col">
        <div className={s.summaryTitle}>Outstanding FIAT debt</div>
        <div className={s.summaryValue}>{outstandingFIATDebt}</div>
      </Grid>
      <Grid colsTemplate="auto auto" flow="col">
        <div className={s.summaryTitle}>New FIAT debt</div>
        <div className={s.summaryValue}>{newFIATDebt}</div>
      </Grid>
      <Grid colsTemplate="auto auto" flow="col">
        <div className={s.summaryTitle}>Stability fee</div>
        <div className={s.summaryValue}>{stabilityFee}</div>
      </Grid>
    </Grid>
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

      if (allowance.lt(tokenAmount.toFixed())) {
        await approve()
      }

      // TODO Extract logic to be agnostic of protocol used (vault). addCollateral('element', token, amount, fiat)
      let encodedFunctionData = ''
      if (fiatAmount.eq(0)) {
        encodedFunctionData = userActions.interface.encodeFunctionData('addCollateral', [
          VAULT_ADDRESS,
          tokenAddress,
          tokenAmount.toFixed(),
        ])
      } else {
        encodedFunctionData = userActions.interface.encodeFunctionData(
          'addCollateralAndIncreaseDebt',
          [VAULT_ADDRESS, tokenAddress, tokenAmount.toFixed(), fiatAmount.toFixed()],
        )
      }

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
  const humanReadableValue = useMemo(
    () => (balance ? getHumanValue(BigNumber.from(balance.toString()), 6) : 0),
    [balance],
  )

  const initialCurrent = isProxyAvailable ? (hasAllowance ? 4 : 3) : 1

  const [step, setStep] = useState({ current: initialCurrent, total: 5 })

  console.log({ hasAllowance, step })

  const increaseStep = useCallback(() => {
    setStep((prev) => {
      if (prev.current === step.total) {
        return prev
      }

      if (prev.current === 1 && isProxyAvailable) {
        return { ...prev, current: 3 }
      }

      if (prev.current < 3 && hasAllowance) {
        return { ...prev, current: 4 }
      }

      return { ...prev, current: prev.current + 1 }
    })
  }, [hasAllowance, isProxyAvailable, step.total])

  const STEPS: { [key: number]: { title: string; subtitle: string } } = {
    1: {
      title: 'Configure your position',
      subtitle: 'Select which asset to deposit and how much FIAT to mint.',
    },
    2: {
      title: 'Create a Proxy contract',
      subtitle: 'The Proxy Contract will allow you to interact with the FIAT protocol...',
    },
    3: {
      title: 'Set Collateral Allowance',
      subtitle: 'Give permission to the FIAT protocol to manager your Collateral',
    },
    5: {
      title: 'Confirm your new position',
      subtitle: 'Review and verify the details of your new position',
    },
  }

  useEffect(() => {
    if (step.current === 3 && !loadingApprove && hasAllowance) {
      increaseStep()
    }
  }, [hasAllowance, increaseStep, loadingApprove, step])

  return (
    <Grid flow="row" gap={16}>
      <StepperTitle
        currentStep={step.current}
        subtitle={STEPS[step.current]?.subtitle ?? STEPS['1'].subtitle}
        title={STEPS[step.current]?.title ?? STEPS['1'].title}
        totalSteps={step.total}
      />
      <Grid align="center" colsTemplate="auto auto" flow="col">
        <h3>Deposit {tokenSymbol}</h3>
        <p className={s.currentValue}>Current value: {humanReadableValue?.toFixed()}</p>
      </Grid>
      <Form
        form={form}
        initialValues={{ tokenAmount: 0, fiatAmount: 0 }}
        onFinish={handleSubmit}
        validateTrigger={['onSubmit']}
      >
        <div className="content-body-item-body">
          <Form.Item
            name="tokenAmount"
            required
            style={{ visibility: [2, 3, 5].includes(step.current) ? 'hidden' : undefined }}
          >
            <TokenAmount
              disabled={false}
              displayDecimals={4}
              hidden={[2, 3, 5].includes(step.current)}
              max={humanReadableValue}
              maximumFractionDigits={6}
              onChange={(val) => val && setTokenFormAmount(val)}
              slider
              tokenIcon={<ElementIcon />}
            />
          </Form.Item>
        </div>
        {!isProxyAvailable && step.current !== 2 && (
          <div className="content-body-item-body">
            <Button onClick={increaseStep}>Setup Proxy</Button>
          </div>
        )}
        {!hasAllowance && isProxyAvailable && step.current !== 3 && (
          <div className="content-body-item-body">
            <Button onClick={increaseStep}>Allow Collateral management</Button>
          </div>
        )}
        {step.current === 2 && (
          <div className="content-body-item-body">
            <Button onClick={setupProxy}>Create Proxy</Button>
          </div>
        )}
        {step.current === 3 && (
          <div className="content-body-item-body">
            <Button disabled={loadingApprove} onClick={approve}>
              {loadingApprove ? 'loading' : 'Approve'}
            </Button>
          </div>
        )}

        <div className="content-body-item-body">
          <Form.Item
            dependencies={['tokenAmount']}
            name="fiatAmount"
            required
            style={{ visibility: step.current !== 4 ? 'hidden' : undefined }}
          >
            <TokenAmount
              disabled={false}
              displayDecimals={4}
              hidden={step.current !== 4}
              max={tokenFormAmount}
              maximumFractionDigits={6}
              slider
              tokenIcon={<FiatIcon />}
            />
          </Form.Item>
        </div>

        {step.current === 4 && (
          <div className="content-body-item-body">
            <Button onClick={increaseStep}>Deposit collateral</Button>
          </div>
        )}

        <OpenPositionSummary
          currentCollateralValue={0}
          newFIATDebt={0}
          outstandingFIATDebt={0}
          stabilityFee={0}
        />

        {step.current === 5 && (
          <>
            <div className="content-body-item-body">Summary...</div>
            <div className="content-body-item-body">
              <Form.Item>
                <Button
                  disabled={!hasAllowance || !isProxyAvailable}
                  htmlType="submit"
                  type="primary"
                >
                  Confirm
                </Button>
              </Form.Item>
            </div>
          </>
        )}
      </Form>
    </Grid>
  )
}

const OpenPosition = () => {
  const {
    query: { collateralId: tokenAddress },
  } = useRouter()
  const { tokenSymbol } = useTokenSymbol(tokenAddress as string)

  return (
    <>
      {/* TODO: implement dynamic titles */}
      {/*<Header title={`Open ${tokenSymbol} position`} />*/}
      <Link href="/open-position" passHref>
        <Button>Back</Button>
      </Link>
      <FormERC20 tokenAddress={tokenAddress as string} tokenSymbol={tokenSymbol} value="$5,000" />
    </>
  )
}

export default genericSuspense(OpenPosition)
