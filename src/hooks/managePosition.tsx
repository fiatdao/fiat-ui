import { usePosition } from './subgraph/usePosition'
import { ZERO_BIG_NUMBER } from '../constants/misc'
import { Contract } from '@ethersproject/contracts'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { JsonRpcProvider } from '@ethersproject/providers'
import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { useUserActions } from '@/src/hooks/useUserActions'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { getHumanValue } from '@/src/web3/utils'
import { ERC20, FIAT, UserActions20 } from '@/types/typechain'
import useContractCall from '@/src/hooks/contracts/useContractCall'

type ManageForm = {
  address: string | null
  userActions: UserActions20
  userProxy: Contract | null
}

type TokenInfo = {
  decimals?: number
  humanValue?: BigNumber
}

type UseDecimalsAndTokenValue = {
  tokenInfo?: TokenInfo
  updateToken: () => Promise<void>
}

const useDecimalsAndTokenValue = ({
  address,
  readOnlyAppProvider,
  tokenAddress,
}: {
  tokenAddress?: string
  address: string | null
  readOnlyAppProvider: JsonRpcProvider
}): UseDecimalsAndTokenValue => {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>()

  const updateToken = useCallback(async () => {
    if (tokenAddress && readOnlyAppProvider && address) {
      const collateral = new Contract(
        tokenAddress,
        contracts.ERC_20.abi,
        readOnlyAppProvider,
      ) as ERC20

      await Promise.all([collateral.decimals(), collateral.balanceOf(address)]).then(
        ([decimals, balance]) => {
          setTokenInfo({
            decimals,
            humanValue: getHumanValue(BigNumber.from(balance.toString()), decimals),
          })
        },
      )
    }
  }, [tokenAddress, readOnlyAppProvider, address])

  useEffect(() => {
    updateToken()
  }, [tokenAddress, readOnlyAppProvider, address, updateToken])

  return { tokenInfo, updateToken }
}

type UseFiatBalance = {
  fiatInfo?: TokenInfo
  updateFiat: () => Promise<void>
}

const useFiatBalance = ({
  address,
  appChainId,
}: {
  address: string | null
  appChainId: ChainsValues
}): UseFiatBalance => {
  const [FIATBalance, updateFiat] = useContractCall(
    contracts.FIAT.address[appChainId],
    contracts.FIAT.abi,
    'balanceOf',
    [address],
  )
  const fiatInfo: TokenInfo = {
    decimals: contracts.FIAT.decimals,
    humanValue: FIATBalance ? getHumanValue(FIATBalance.toString(), 18) : ZERO_BIG_NUMBER,
  }
  return { fiatInfo, updateFiat }
}

type UseDepositForm = ManageForm & {
  tokenInfo?: TokenInfo
  fiatInfo?: TokenInfo
  updateFiat: () => Promise<void>
  updateToken: () => Promise<void>
}

export const useDepositForm = ({ tokenAddress }: { tokenAddress: string }): UseDepositForm => {
  const { address, appChainId, readOnlyAppProvider } = useWeb3Connection()
  const userActions = useUserActions()
  const { userProxy } = useUserProxy()
  const { tokenInfo, updateToken } = useDecimalsAndTokenValue({
    tokenAddress,
    address,
    readOnlyAppProvider,
  })
  const { fiatInfo, updateFiat } = useFiatBalance({ address, appChainId })

  return { address, tokenInfo, updateFiat, updateToken, userActions, userProxy, fiatInfo }
}

type UseWithdrawForm = ManageForm & {
  tokenInfo?: TokenInfo
}

export const useWithdrawForm = ({ tokenAddress }: { tokenAddress?: string }): UseWithdrawForm => {
  const { address, readOnlyAppProvider } = useWeb3Connection()
  const userActions = useUserActions()
  const { userProxy } = useUserProxy()
  const { tokenInfo } = useDecimalsAndTokenValue({ tokenAddress, address, readOnlyAppProvider })

  return { address, tokenInfo, userActions, userProxy }
}

type UseMintForm = ManageForm & {
  fiatInfo?: TokenInfo
  updateFiat: () => Promise<void>
}

export const useMintForm = (): UseMintForm => {
  const { address, appChainId } = useWeb3Connection()
  const userActions = useUserActions()
  const { userProxy } = useUserProxy()
  const { fiatInfo, updateFiat } = useFiatBalance({ address, appChainId })

  return { address, userActions, userProxy, fiatInfo, updateFiat }
}

type UseBurnForm = ManageForm & {
  tokenInfo?: TokenInfo
  fiatInfo?: TokenInfo
  updateAllowance: () => Promise<any>
  updateFiat: () => Promise<any>
  fiatAllowance?: BigNumber
}

export const useBurnForm = ({ tokenAddress }: { tokenAddress?: string }): UseBurnForm => {
  const { address, appChainId, readOnlyAppProvider, web3Provider } = useWeb3Connection()
  const userActions = useUserActions()
  const { userProxy, userProxyAddress } = useUserProxy()

  const { tokenInfo } = useDecimalsAndTokenValue({ address, readOnlyAppProvider, tokenAddress })
  const { fiatInfo, updateFiat } = useFiatBalance({ address, appChainId })
  const [fiatAllowance] = useContractCall(
    contracts.FIAT.address[appChainId],
    contracts.FIAT.abi,
    'allowance',
    [address, userProxyAddress],
  )

  const updateAllowance = useCallback(async () => {
    if (tokenAddress && web3Provider && address && userProxyAddress) {
      const fiatToken = new Contract(
        contracts.FIAT.address[appChainId],
        contracts.FIAT.abi,
        web3Provider.getSigner(),
      ) as FIAT
      return fiatToken.approve(userProxyAddress, ethers.constants.MaxUint256)
    }
    return Promise.resolve(null)
  }, [tokenAddress, web3Provider, address, userProxyAddress, appChainId])

  return {
    address,
    fiatInfo,
    fiatAllowance,
    updateFiat,
    userActions,
    userProxy,
    tokenInfo,
    updateAllowance,
  }
}

export const useManagePositionInfo = () => {
  const {
    query: { positionId }, // TODO Query guard.
  } = useRouter()
  // const { isWalletConnected } = useWeb3Connection()
  // TODO Pass enabled: isWalletConnected && isValidPositionIdType(positionId) && isValidPositionId(positionId)

  return usePosition(positionId as string)
}
