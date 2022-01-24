import { BigNumberish } from '@ethersproject/bignumber'
import { Button } from 'antd'
import AntdForm from 'antd/lib/form'
import { isArray } from 'lodash'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useUserActions } from '@/src/hooks/useUserActions'
import ElementIcon from '@/src/resources/svg/element.svg'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { Form } from '@/src/components/antd'
import { Tab, Tabs, TokenAmount } from '@/src/components/custom'
import { Position, PositionTransaction, fetchPositionById } from '@/src/utils/your-positions-api'
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
  positionId: string | string[] | undefined,
): { vaultAddress: string; tokenId: string; proxyAddress: string } | Record<string, unknown> => {
  if (!positionId || isArray(positionId)) {
    return {}
  }

  const [vaultAddress, tokenIdInHex, proxyAddress] = positionId.split('-')
  const tokenId = BigInt(tokenIdInHex).toString()

  return { vaultAddress, tokenId, proxyAddress }
}

const COLLATERAL_BY_VAULT_ADDRESS: Record<string, string> = {
  '0xeCdB7DC331a8b5117eCF548Fa4730b0dAe76077D': '0xdcf80c068b7ffdf7273d8adae4b076bf384f711a',
}

const PositionManager = () => {
  const { isWalletConnected, readOnlyAppProvider: provider } = useWeb3Connection()
  const {
    query: { positionId },
  } = useRouter()
  const [positionInfo, setPositionInfo] = useState<[Position, PositionTransaction[]]>()

  useEffect(() => {
    if (
      isWalletConnected &&
      provider &&
      isValidPositionIdType(positionId) &&
      isValidPositionId(positionId)
    ) {
      fetchPositionById(positionId, provider).then(setPositionInfo).catch(console.error)
    }
  }, [isWalletConnected, provider, positionId])

  const [activeSection, setActiveSection] = useState<'collateral' | 'fiat'>('collateral')
  const [activeTabKey, setActiveTabKey] = useState<'deposit' | 'withdraw' | 'mint' | 'burn'>(
    'deposit',
  )
  useEffect(() => {
    setActiveTabKey(() => (activeSection === 'collateral' ? 'deposit' : 'mint'))
  }, [activeSection])

  const { userProxy } = useUserProxy()
  const userActions = useUserActions()

  const [form1] = AntdForm.useForm()
  const handleDeposit = async ({ deposit }: { deposit: BigNumberish }) => {
    console.log(deposit)

    const { proxyAddress, vaultAddress } = extractPositionIdData(positionId)

    if (typeof vaultAddress === 'string') {
      const collateralAddress = COLLATERAL_BY_VAULT_ADDRESS[vaultAddress]

      if (collateralAddress !== undefined) {
        const addCollateralEncoded = userActions.interface.encodeFunctionData('addCollateral', [
          vaultAddress,
          collateralAddress,
          deposit,
        ])

        const tx = await userProxy?.execute(proxyAddress, addCollateralEncoded, {
          gasLimit: 10000000,
        })

        console.log('adding collateral...', tx.hash)
        const receipt = await tx.wait()
        console.log('Collateral added!', { receipt })
      }
    }
  }

  const [form2] = AntdForm.useForm()
  const handleWithdraw = ({ withdraw }: { withdraw: string }) => {
    console.log(withdraw)
  }

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
      {'collateral' === activeSection && (
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
              <Form
                form={form1}
                initialValues={{ tokenAmount: 0, fiatAmount: 0 }}
                onFinish={handleDeposit}
                validateTrigger={['onSubmit']}
              >
                <Form.Item name="deposit" required>
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
                    Deposit collateral
                  </Button>
                </Form.Item>
              </Form>
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
      )}
      {'fiat' === activeSection && (
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
