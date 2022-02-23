import { usePosition } from './subgraph/usePosition'
import { ZERO_ADDRESS } from '../constants/misc'
import { Contract } from '@ethersproject/contracts'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { JsonRpcProvider } from '@ethersproject/providers'
import { KeyedMutator } from 'swr'
import { useFIATBalance } from '@/src/hooks/useFIATBalance'
import { contracts } from '@/src/constants/contracts'
import { useUserActions } from '@/src/hooks/useUserActions'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { getHumanValue } from '@/src/web3/utils'
import { ERC20, UserActions20 } from '@/types/typechain'
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

type UseDepositForm = ManageForm & {
  tokenInfo?: TokenInfo
  fiatInfo?: BigNumber
  updateFiat: () => Promise<void>
  updateToken: () => Promise<void>
}

export const useDepositForm = ({ tokenAddress }: { tokenAddress: string }): UseDepositForm => {
  const { address, readOnlyAppProvider } = useWeb3Connection()
  const userActions = useUserActions()
  const { userProxy } = useUserProxy()
  const { tokenInfo, updateToken } = useDecimalsAndTokenValue({
    tokenAddress,
    address,
    readOnlyAppProvider,
  })

  const [fiatInfo, updateFiat] = useFIATBalance(true)

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
  fiatInfo?: BigNumber
  updateFiat: KeyedMutator<any>
}

export const useMintForm = (): UseMintForm => {
  const { address } = useWeb3Connection()
  const userActions = useUserActions()
  const { userProxy } = useUserProxy()
  const [fiatInfo, updateFiat] = useFIATBalance(true)

  return { address, userActions, userProxy, fiatInfo, updateFiat }
}

type BurnFiat = {
  vault: string
  token: string
  tokenId: number
  toWithdraw: BigNumber
  toBurn: BigNumber
}

type UseBurnForm = ManageForm & {
  tokenInfo?: TokenInfo
  fiatInfo?: BigNumber
  approveToken: () => Promise<any>
  burnFiat: (arg0: BurnFiat) => Promise<any>
  updateFiat: () => Promise<any>
  fiatAllowance?: BigNumber
}

export const useBurnForm = ({ tokenAddress }: { tokenAddress?: string }): UseBurnForm => {
  const { address, appChainId, readOnlyAppProvider, web3Provider } = useWeb3Connection()
  const userActions = useUserActions()
  const { userProxy, userProxyAddress } = useUserProxy()

  const { tokenInfo } = useDecimalsAndTokenValue({ address, readOnlyAppProvider, tokenAddress })
  const [fiatInfo, updateFiat] = useFIATBalance(true)
  const [fiatAllowance] = useContractCall(
    contracts.FIAT.address[appChainId],
    contracts.FIAT.abi,
    'allowance',
    [address, userProxyAddress],
  )

  const burnFiat = useCallback(
    async ({ toBurn, toWithdraw, token, tokenId, vault }: BurnFiat) => {
      if (!fiatInfo || !userProxy || !address || !token || !vault) {
        return
      }
      const burnEncoded = userActions.interface.encodeFunctionData('modifyCollateralAndDebt', [
        vault,
        token,
        tokenId,
        toWithdraw.isZero() ? ZERO_ADDRESS : address,
        address,
        toWithdraw.negated().toFixed(),
        toBurn.negated().toFixed(),
      ])

      const tx = await userProxy.execute(userActions.address, burnEncoded, {
        gasLimit: 1_000_000,
      })

      return tx.wait()
    },
    [fiatInfo, userProxy, address, userActions.address, userActions.interface],
  )

  const approveToken = useCallback(async () => {
    if (tokenAddress && web3Provider && address && userProxy) {
      const MAX_AVAILABLE_AMOUNT = ethers.constants.MaxUint256
      const approveToken = userActions.interface.encodeFunctionData('approveToken', [
        contracts.FIAT.address[appChainId],
        contracts.MONETA.address[appChainId],
        MAX_AVAILABLE_AMOUNT,
      ])

      const tx = await userProxy.execute(userActions.address, approveToken, {
        gasLimit: 1_000_000,
      })
      return tx.wait()
    }
    return Promise.resolve(null)
  }, [
    tokenAddress,
    userProxy,
    web3Provider,
    address,
    appChainId,
    userActions.address,
    userActions.interface,
  ])

  return {
    address,
    fiatInfo,
    fiatAllowance,
    updateFiat,
    burnFiat,
    userActions,
    userProxy,
    tokenInfo,
    approveToken,
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
