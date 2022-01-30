import { Contract } from '@ethersproject/contracts'
import { Button } from 'antd'
import AntdForm from 'antd/lib/form'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ReactNode, useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import useSWR, { KeyedMutator } from 'swr'
import { Chains } from '@/src/constants/chains'
import { getHumanValue, getNonHumanValue } from '@/src/web3/utils'
import { FIAT, TestERC20, VaultEPT } from '@/types/typechain'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { contracts } from '@/src/constants/contracts'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useUserActions } from '@/src/hooks/useUserActions'
import ElementIcon from '@/src/resources/svg/element.svg'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import { Form } from '@/src/components/antd'
import { Tab, Tabs, TokenAmount } from '@/src/components/custom'
import { Position, fetchPositionById } from '@/src/utils/your-positions-api'
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
  positionId?: string,
): { vaultAddress: string; tokenId: string; proxyAddress: string } => {
  if (!isValidPositionIdType(positionId) || !isValidPositionId(positionId)) {
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
    [contracts.FIAT.address[Chains.goerli].toLowerCase()]: <FiatIcon />,
  },
  {
    get: function (target, prop) {
      if (typeof prop === 'string') {
        return target[prop.toLowerCase()]
      }
    },
  },
)

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
      return fetchPositionById(positionId, provider).then(([position]) => position)
    }
  })

  if (error) {
    console.error('Failed to retrieve PositionId information', error)
  }

  return { data, mutate }
}

const DepositForm = ({
  tokenAddress,
  vaultAddress,
}: {
  tokenAddress: string
  vaultAddress: string
}) => {
  const { address: currentUserAddress, readOnlyAppProvider: provider } = useWeb3Connection()
  const { userProxy } = useUserProxy()
  const userActions = useUserActions()
  const [form] = AntdForm.useForm()

  const [tokenInfo, setTokenInfo] = useState<{
    decimals: number
    humanValue?: BigNumber
  }>({ decimals: 0 })

  useEffect(() => {
    if (currentUserAddress) {
      const collateral = new Contract(tokenAddress, contracts.TEST_ERC20.abi, provider) as TestERC20

      Promise.all([collateral.decimals(), collateral.balanceOf(currentUserAddress)]).then(
        ([decimals, balance]) => {
          setTokenInfo({
            decimals,
            humanValue: getHumanValue(BigNumber.from(balance.toString()), decimals),
          })
        },
      )
    }
  }, [tokenAddress, currentUserAddress, provider])

  const handleDeposit = async ({ deposit }: { deposit: BigNumber }) => {
    const toDeposit = getNonHumanValue(deposit, tokenInfo.decimals)
    console.log('MANAGE', { toDeposit: toDeposit.toFixed() })
    const addCollateralEncoded = userActions.interface.encodeFunctionData('addCollateral', [
      vaultAddress,
      tokenAddress,
      toDeposit.toFixed(),
    ])

    const tx = await userProxy?.execute(userActions.address, addCollateralEncoded, {
      gasLimit: 1_000_000,
    })
    console.log('adding collateral...', tx.hash)

    const receipt = await tx.wait()
    console.log('Collateral added!', { receipt })
  }

  return (
    <Form form={form} onFinish={handleDeposit}>
      <Form.Item name="deposit" required>
        <TokenAmount
          displayDecimals={tokenInfo.decimals}
          max={tokenInfo.humanValue}
          maximumFractionDigits={tokenInfo.decimals}
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

const WithdrawForm = ({
  refetch,
  tokenAddress,
  userBalance,
  vaultAddress,
}: {
  refetch: KeyedMutator<Position | undefined>
  tokenAddress: string
  userBalance?: number
  vaultAddress: string
}) => {
  const { address: currentUserAddress, readOnlyAppProvider: provider } = useWeb3Connection()
  const { userProxy } = useUserProxy()
  const userActions = useUserActions()
  const [form] = AntdForm.useForm()

  const [wrappedCollateralInfo, setWrappedCollateralInfo] = useState<{ decimals: number }>()

  // FixMe: why `dec` returns 18 decimals for ElementPT when it's 6 instead?
  useEffect(() => {
    if (currentUserAddress) {
      const vaultEPT = new Contract(vaultAddress, contracts.VAULT_EPT.abi, provider) as VaultEPT

      vaultEPT.dec().then((decimals) => {
        setWrappedCollateralInfo({ decimals: decimals.toNumber() })
      })
    }
  }, [currentUserAddress, provider, vaultAddress])

  const handleWithdraw = async ({ withdraw }: { withdraw: BigNumber }) => {
    if (wrappedCollateralInfo) {
      const toWithdraw = getNonHumanValue(withdraw, wrappedCollateralInfo.decimals)
      console.log('MANAGE', { toWithdraw: toWithdraw.toFixed() })
      const removeCollateralEncoded = userActions.interface.encodeFunctionData('removeCollateral', [
        vaultAddress,
        tokenAddress,
        toWithdraw.toFixed(),
      ])

      const tx = await userProxy?.execute(userActions.address, removeCollateralEncoded, {
        gasLimit: 1_000_000,
      })
      console.log('withdrawing...', tx.hash)

      const receipt = await tx.wait()
      console.log('Collateral withdrawn', { receipt })

      refetch()
    }
  }

  return (
    <Form form={form} onFinish={handleWithdraw}>
      <Form.Item name="withdraw" required>
        <TokenAmount
          disabled={false}
          displayDecimals={wrappedCollateralInfo?.decimals}
          max={userBalance}
          maximumFractionDigits={wrappedCollateralInfo?.decimals}
          slider
          tokenIcon={iconByAddress[tokenAddress]}
        />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary">
          Withdraw collateral
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

const ManageCollateral = ({ activeTabKey, setActiveTabKey }: ManageCollateralProps) => {
  const { data: position, mutate: refetchPosition } = useManagePositionInfo()

  const { tokenId, vaultAddress } = extractPositionIdData(
    position?.action?.data?.positionId as string,
  )

  const [collateralAddress] = useContractCall(
    vaultAddress,
    contracts.VAULT_EPT.abi,
    'getTokenAddress',
    [tokenId],
  )

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
        <DepositForm tokenAddress={collateralAddress} vaultAddress={vaultAddress} />
      )}
      {'withdraw' === activeTabKey && (
        <WithdrawForm
          refetch={refetchPosition}
          tokenAddress={collateralAddress}
          userBalance={position?.discount}
          vaultAddress={vaultAddress}
        />
      )}
      <pre>{JSON.stringify(position, null, 2)}</pre>
    </>
  )
}

const MintForm = ({
  refetch,
  tokenAddress,
  userBalance,
  vaultAddress,
}: {
  refetch: KeyedMutator<Position | undefined>
  tokenAddress: string
  userBalance?: number
  vaultAddress: string
}) => {
  const { address: userAddress, readOnlyAppProvider: provider, web3Provider } = useWeb3Connection()
  const { userProxy, userProxyAddress } = useUserProxy()
  const userActions = useUserActions()
  const [form] = AntdForm.useForm()

  const [wrappedCollateralInfo, setWrappedCollateralInfo] = useState<{ decimals: number }>()

  useEffect(() => {
    if (userAddress) {
      const vaultEPT = new Contract(vaultAddress, contracts.VAULT_EPT.abi, provider) as VaultEPT

      vaultEPT.dec().then((decimals) => {
        setWrappedCollateralInfo({ decimals: decimals.toNumber() })
      })
    }
  }, [userAddress, provider, vaultAddress])

  const handleMint = async ({ mint }: { mint: BigNumber }) => {
    if (web3Provider && userAddress && userProxy && userProxyAddress && wrappedCollateralInfo) {
      const collateralToken = new Contract(
        tokenAddress,
        contracts.TEST_ERC20.abi,
        web3Provider.getSigner(),
      ) as TestERC20

      const toMint = getNonHumanValue(mint, contracts.FIAT.decimals)
      // const userCollateralBalance = collateralToken.balanceOf(userAddress)

      if ((await collateralToken.allowance(userAddress, userProxyAddress)).lt(toMint.toFixed())) {
        await collateralToken.approve(userProxyAddress, toMint.toFixed())
      }

      const increaseDebtEncoded = userActions.interface.encodeFunctionData('increaseDebt', [
        vaultAddress,
        tokenAddress,
        toMint.toFixed(),
      ])

      const tx = await userProxy.execute(userActions.address, increaseDebtEncoded, {
        gasLimit: 1_000_000,
      })
      console.log('minting...', tx.hash)

      const receipt = await tx.wait()
      console.log('Debt (FIAT) minted', { receipt })

      refetch()
    }
  }

  return (
    <Form form={form} onFinish={handleMint}>
      <Form.Item name="mint" required>
        <TokenAmount
          disabled={false}
          displayDecimals={contracts.FIAT.decimals}
          max={userBalance}
          maximumFractionDigits={contracts.FIAT.decimals}
          slider
          tokenIcon={iconByAddress[contracts.FIAT.address[Chains.goerli]]}
        />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary">
          Mint FIAT
        </Button>
      </Form.Item>
    </Form>
  )
}

const BurnForm = ({
  refetch,
  tokenAddress,
  userBalance,
  vaultAddress,
}: {
  refetch: KeyedMutator<Position | undefined>
  tokenAddress: string
  userBalance?: number
  vaultAddress: string
}) => {
  const [form] = AntdForm.useForm()
  const { address: userAddress, web3Provider } = useWeb3Connection()
  const userActions = useUserActions()
  const { userProxy, userProxyAddress } = useUserProxy()

  const handleBurn = async ({ burn }: { burn: BigNumber }) => {
    if (userAddress && web3Provider && userProxy && userProxyAddress) {
      const fiatToken = new Contract(
        contracts.FIAT.address[Chains.goerli],
        contracts.FIAT.abi,
        web3Provider.getSigner(),
      ) as FIAT

      const toBurn = getNonHumanValue(burn, contracts.FIAT.decimals)

      if ((await fiatToken.allowance(userAddress, userProxyAddress)).lt(toBurn.toFixed())) {
        await fiatToken.approve(userProxyAddress, toBurn.toFixed())
      }

      const burnDebtEncoded = userActions.interface.encodeFunctionData('decreaseDebt', [
        vaultAddress,
        tokenAddress,
        toBurn.toFixed(),
      ])

      const tx = await userProxy.execute(userActions.address, burnDebtEncoded, {
        gasLimit: 1_000_000,
      })
      console.log('burning...', tx.hash)

      const receipt = await tx.wait()
      console.log('Debt (FIAT) burnt', { receipt })

      // force update the value via SG query
      refetch()
    }
  }

  return (
    <Form form={form} onFinish={handleBurn}>
      <Form.Item name="burn" required>
        <TokenAmount
          displayDecimals={contracts.FIAT.decimals}
          max={userBalance}
          maximumFractionDigits={contracts.FIAT.decimals}
          slider
          tokenIcon={iconByAddress[contracts.FIAT.address[Chains.goerli]]}
        />
      </Form.Item>
      <Form.Item>
        <Button htmlType="submit" type="primary">
          Burn FIAT
        </Button>
      </Form.Item>
    </Form>
  )
}

const ManageFiat = ({ activeTabKey, setActiveTabKey }: ManageFiatProps) => {
  const { data: position, mutate: refetchPosition } = useManagePositionInfo()

  const { tokenId, vaultAddress } = extractPositionIdData(
    position?.action?.data?.positionId as string,
  )

  const [collateralAddress] = useContractCall(
    vaultAddress,
    contracts.VAULT_EPT.abi,
    'getTokenAddress',
    [tokenId],
  )

  return (
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
        <MintForm
          refetch={refetchPosition}
          tokenAddress={collateralAddress}
          userBalance={position?.discount}
          vaultAddress={vaultAddress}
        />
      )}
      {'burn' === activeTabKey && (
        <BurnForm
          refetch={refetchPosition}
          tokenAddress={collateralAddress}
          userBalance={position?.minted}
          vaultAddress={vaultAddress}
        />
      )}
    </>
  )
}

const PositionManager = () => {
  const [activeSection, setActiveSection] = useState<'collateral' | 'fiat'>('collateral')
  const [activeTabKey, setActiveTabKey] = useState<
    ManageCollateralProps['activeTabKey'] | ManageFiatProps['activeTabKey']
  >('deposit')

  useEffect(() => {
    setActiveTabKey(() => (activeSection === 'collateral' ? 'deposit' : 'mint'))
  }, [activeSection])

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
        <ManageFiat activeTabKey={activeTabKey} setActiveTabKey={setActiveTabKey} />
      )}
    </>
  )
}

export default genericSuspense(PositionManager)
