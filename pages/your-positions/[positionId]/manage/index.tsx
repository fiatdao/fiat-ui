import { Contract } from '@ethersproject/contracts'
import { Button } from 'antd'
import AntdForm from 'antd/lib/form'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import useSWR from 'swr'
import { getHumanValue, getNonHumanValue } from '@/src/web3/utils'
import { TestERC20 } from '@/types/typechain'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { contracts } from '@/src/constants/contracts'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useUserActions } from '@/src/hooks/useUserActions'
import ElementIcon from '@/src/resources/svg/element.svg'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { Form } from '@/src/components/antd'
import { Tab, Tabs, TokenAmount } from '@/src/components/custom'
import { fetchPositionById } from '@/src/utils/your-positions-api'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import genericSuspense from '@/src/utils/genericSuspense'

const isValidPositionIdType = (positionId: string | string[] | undefined): positionId is string => {
  return typeof positionId === 'string'
}

const isValidPositionId = (positionId: string | string[] | undefined): boolean => {
  if (!isValidPositionIdType(positionId)) {
    return false
  }

  const positionIdRegex = new RegExp(/^(0x[a-f0-9]{40})-(0x[a-f0-9]{40})-(0x[a-f0-9]{40})$/, 'ig')
  return positionIdRegex.test(positionId)
}

const extractPositionIdData = (
  positionId: string,
): { vaultAddress: string; tokenId: string; proxyAddress: string } => {
  if (!isValidPositionId(positionId)) {
    const error = new Error('Invalid position Id')
    error.name = 'INVALID_POSITION_ID'

    throw error
  }

  const [vaultAddress, tokenIdInHex, proxyAddress] = positionId.split('-')
  const tokenId = BigInt(tokenIdInHex).toString()

  return { vaultAddress, tokenId, proxyAddress }
}

const iconByAddress = new Proxy<Record<string, ReactNode>>(
  {
    '0xdcf80c068b7ffdf7273d8adae4b076bf384f711a': <ElementIcon />,
  },
  {
    get: function (target, prop) {
      if (typeof prop === 'string') {
        return target[prop.toLowerCase()]
      }
    },
  },
)

const DepositInput = ({
  tokenAddress,
  tokenDecimals,
  tokenMaxValue,
  vaultAddress,
}: {
  tokenAddress: string
  tokenDecimals: number
  tokenMaxValue?: BigNumber
  vaultAddress: string
}) => {
  const { userProxy } = useUserProxy()
  const userActions = useUserActions()
  const [form] = AntdForm.useForm()

  const handleDeposit = async ({ deposit }: { deposit: BigNumber }) => {
    const toDeposit = getNonHumanValue(deposit, tokenDecimals)
    const addCollateralEncoded = userActions.interface.encodeFunctionData('addCollateral', [
      vaultAddress,
      tokenAddress,
      toDeposit.toFixed(),
    ])

    const tx = await userProxy?.execute(userActions.address, addCollateralEncoded, {
      gasLimit: 10000000,
    })
    console.log('adding collateral...', tx.hash)

    const receipt = await tx.wait()
    console.log('Collateral added!', { receipt })
  }

  return (
    <Form form={form} onFinish={handleDeposit}>
      <Form.Item name="deposit" required>
        <TokenAmount
          displayDecimals={tokenDecimals}
          max={tokenMaxValue}
          maximumFractionDigits={tokenDecimals}
          slider
          tokenIcon={iconByAddress[tokenAddress]}
        />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary">
          Deposit collateral
        </Button>
      </Form.Item>
    </Form>
  )
}

const COLLATERAL_KEYS = ['deposit', 'withdraw'] as const

interface ManageCollateralProps {
  activeTabKey: typeof COLLATERAL_KEYS[number]
  setActiveTabKey: (key: ManageCollateralProps['activeTabKey']) => void
}

const isCollateralTab = (key: string): key is ManageCollateralProps['activeTabKey'] => {
  return COLLATERAL_KEYS.includes(key as ManageCollateralProps['activeTabKey'])
}

const FIAT_KEYS = ['burn', 'mint'] as const

interface ManageFiatProps {
  activeTabKey: typeof FIAT_KEYS[number]
  setActiveTabKey: (key: ManageFiatProps['activeTabKey']) => void
}

const isFiatTab = (key: string): key is ManageFiatProps['activeTabKey'] => {
  return FIAT_KEYS.includes(key as ManageFiatProps['activeTabKey'])
}

const ManageCollateral = ({ activeTabKey = 'deposit', setActiveTabKey }: ManageCollateralProps) => {
  const { address: currentUserAddress, readOnlyAppProvider: provider } = useWeb3Connection()
  const {
    query: { positionId },
  } = useRouter()
  const { tokenId, vaultAddress } = extractPositionIdData(positionId as string)

  const [collateralAddress] = useContractCall(
    vaultAddress,
    contracts.VAULT_EPT.abi,
    'getTokenAddress',
    [tokenId],
  )

  const [collateralInfo, setCollateralInfo] = useState<{
    decimals: number
    humanValue?: BigNumber
  }>({ decimals: 0 })

  useEffect(() => {
    if (collateralAddress && currentUserAddress) {
      const collateral = new Contract(
        collateralAddress,
        contracts.TEST_ERC20.abi,
        provider,
      ) as TestERC20

      Promise.all([collateral.decimals(), collateral.balanceOf(currentUserAddress)]).then(
        ([decimals, balance]) => {
          setCollateralInfo({
            decimals,
            humanValue: balance
              ? getHumanValue(BigNumber.from(balance.toString()), decimals)
              : undefined,
          })
        },
      )
    }
  }, [collateralAddress, currentUserAddress, provider])

  const [form2] = AntdForm.useForm()
  const handleWithdraw = ({ withdraw }: { withdraw: string }) => {
    console.log(withdraw)
  }

  return (
    <>
      <Tabs>
        <Tab isActive={'deposit' === activeTabKey} onClick={() => setActiveTabKey('deposit')}>
          Deposit
        </Tab>
        <Tab isActive={'withdraw' === activeTabKey} onClick={() => setActiveTabKey('withdraw')}>
          Withdraw
        </Tab>
      </Tabs>
      {'deposit' === activeTabKey && (
        <div>
          <DepositInput
            tokenAddress={collateralAddress}
            tokenDecimals={collateralInfo.decimals}
            tokenMaxValue={collateralInfo.humanValue}
            vaultAddress={vaultAddress}
          />
        </div>
      )}
      {'withdraw' === activeTabKey && (
        <div>
          <Form
            form={form2}
            initialValues={{ tokenAmount: 0, fiatAmount: 0 }}
            onFinish={handleWithdraw}
            validateTrigger={['onSubmit']}
          >
            <Form.Item name="withdraw" required>
              <TokenAmount
                disabled={false}
                displayDecimals={4}
                max={5000}
                maximumFractionDigits={6}
                slider
                tokenIcon={<ElementIcon />}
              />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit" type="primary">
                Withdraw collateral
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}
    </>
  )
}

const useManagePositionInfo = () => {
  const {
    query: { positionId },
  } = useRouter()
  const { isWalletConnected, readOnlyAppProvider: provider } = useWeb3Connection()

  const { data, error, mutate } = useSWR([positionId], () => {
    if (
      isWalletConnected &&
      provider &&
      isValidPositionIdType(positionId) &&
      isValidPositionId(positionId)
    ) {
      return fetchPositionById(positionId, provider)
    }
  })

  if (error) {
    console.error('Failed to retrieve PositionId information', error)
  }

  return [data, mutate]
}

const PositionManager = () => {
  const [positionInfo] = useManagePositionInfo()

  const [activeSection, setActiveSection] = useState<'collateral' | 'fiat'>('collateral')
  const [activeTabKey, setActiveTabKey] = useState<
    ManageCollateralProps['activeTabKey'] | ManageFiatProps['activeTabKey']
  >('deposit')

  useEffect(() => {
    setActiveTabKey(() => (activeSection === 'collateral' ? 'deposit' : 'mint'))
  }, [activeSection])

  const [form3] = AntdForm.useForm()
  const handleMint = ({ mint }: { mint: string }) => {
    console.log(mint)
  }

  const [form4] = AntdForm.useForm()
  const handleBurn = ({ burn }: { burn: string }) => {
    console.log(burn)
  }

  return (
    <>
      <Link href="/your-positions" passHref>
        <Button>Back</Button>
      </Link>
      <Tabs>
        <Tab
          isActive={'collateral' === activeSection}
          onClick={() => setActiveSection('collateral')}
        >
          Collateral
        </Tab>
        <Tab isActive={'fiat' === activeSection} onClick={() => setActiveSection('fiat')}>
          FIAT
        </Tab>
      </Tabs>
      {'collateral' === activeSection && isCollateralTab(activeTabKey) && (
        <ManageCollateral activeTabKey={activeTabKey} setActiveTabKey={setActiveTabKey} />
      )}
      {'fiat' === activeSection && isFiatTab(activeTabKey) && (
        <>
          <Tabs>
            <Tab isActive={'mint' === activeTabKey} onClick={() => setActiveTabKey('mint')}>
              Mint
            </Tab>
            <Tab isActive={'burn' === activeTabKey} onClick={() => setActiveTabKey('burn')}>
              Burn
            </Tab>
          </Tabs>
          {'mint' === activeTabKey && (
            <div>
              <Form
                form={form3}
                initialValues={{ tokenAmount: 0, fiatAmount: 0 }}
                onFinish={handleMint}
                validateTrigger={['onSubmit']}
              >
                <Form.Item name="mint" required>
                  <TokenAmount
                    disabled={false}
                    displayDecimals={4}
                    max={5000}
                    maximumFractionDigits={6}
                    slider
                    tokenIcon={<FiatIcon />}
                  />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit" type="primary">
                    Mint FIAT
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}
          {'burn' === activeTabKey && (
            <div>
              <Form
                form={form4}
                initialValues={{ tokenAmount: 0, fiatAmount: 0 }}
                onFinish={handleBurn}
                validateTrigger={['onSubmit']}
              >
                <Form.Item name="burn" required>
                  <TokenAmount
                    disabled={false}
                    displayDecimals={4}
                    max={5000}
                    maximumFractionDigits={6}
                    slider
                    tokenIcon={<FiatIcon />}
                  />
                </Form.Item>
                <Form.Item>
                  <Button htmlType="submit" type="primary">
                    Burn FIAT
                  </Button>
                </Form.Item>
              </Form>
            </div>
          )}
        </>
      )}
      <pre>{JSON.stringify(positionInfo, null, 2)}</pre>
    </>
  )
}

export default genericSuspense(PositionManager)
