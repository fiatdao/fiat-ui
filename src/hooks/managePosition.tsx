import { usePosition } from './subgraph/usePosition'
import { ZERO_BIG_NUMBER } from '../constants/misc'
import { BigNumber as EthersBN } from '@ethersproject/bignumber'
import { Contract, ContractTransaction } from '@ethersproject/contracts'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Chains, ChainsValues } from '@/src/constants/chains'
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
  updateToken: () => void
}

const useDecimalsAndTokenValue = ({
  address,
  readOnlyAppProvider,
  tokenAddress,
}: {
  tokenAddress: string
  address: string | null
  readOnlyAppProvider: JsonRpcProvider
}): UseDecimalsAndTokenValue => {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo>()

  const updateToken = useCallback(() => {
    if (tokenAddress && readOnlyAppProvider && address) {
      const collateral = new Contract(
        tokenAddress,
        contracts.ERC_20.abi,
        readOnlyAppProvider,
      ) as ERC20

      Promise.all([collateral.decimals(), collateral.balanceOf(address)]).then(
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
  updateFiat: () => void
}

const useFiatBalance = ({
  address,
  appChainId,
}: {
  address: string | null
  appChainId: ChainsValues
}): UseFiatBalance => {
  const [FIATBalance, refetch] = useContractCall(
    contracts.FIAT.address[appChainId],
    contracts.FIAT.abi,
    'balanceOf',
    [address],
  )
  const fiatInfo: TokenInfo = {
    decimals: 18, // 4 or 6 or 18?
    humanValue: FIATBalance ? getHumanValue(FIATBalance.toString(), 18) : ZERO_BIG_NUMBER,
  }
  return { fiatInfo, updateFiat: refetch }
}

type UseDepositForm = ManageForm & {
  tokenInfo?: TokenInfo
  fiatInfo?: TokenInfo
}

export const useDepositForm = ({ tokenAddress }: { tokenAddress: string }): UseDepositForm => {
  const { address, appChainId, readOnlyAppProvider } = useWeb3Connection()
  const userActions = useUserActions()
  const { userProxy } = useUserProxy()
  const { tokenInfo } = useDecimalsAndTokenValue({ tokenAddress, address, readOnlyAppProvider })
  const { fiatInfo } = useFiatBalance({ address, appChainId })

  return { address, tokenInfo, userActions, userProxy, fiatInfo }
}

type UseWithdrawForm = ManageForm & {
  tokenInfo?: TokenInfo
}

export const useWithdrawForm = ({ tokenAddress }: { tokenAddress: string }): UseWithdrawForm => {
  const { address, readOnlyAppProvider } = useWeb3Connection()
  const userActions = useUserActions()
  const { userProxy } = useUserProxy()
  const { tokenInfo } = useDecimalsAndTokenValue({ tokenAddress, address, readOnlyAppProvider })

  return { address, tokenInfo, userActions, userProxy }
}

type UseMintForm = ManageForm & {
  fiatInfo?: TokenInfo
}

export const useMintForm = (): UseMintForm => {
  const { address, appChainId } = useWeb3Connection()
  const userActions = useUserActions()
  const { userProxy } = useUserProxy()
  const { fiatInfo } = useFiatBalance({ address, appChainId })

  return { address, userActions, userProxy, fiatInfo }
}

export const useBurnForm = () => {
  const { address, web3Provider } = useWeb3Connection()
  const userActions = useUserActions()
  const { userProxy, userProxyAddress } = useUserProxy()

  const [fiatInfo, setFiatInfo] =
    useState<{ allowance: EthersBN; approve: () => Promise<ContractTransaction> }>()

  useEffect(() => {
    if (address && web3Provider && userProxy && userProxyAddress) {
      const fiatToken = new Contract(
        contracts.FIAT.address[Chains.goerli],
        contracts.FIAT.abi,
        web3Provider.getSigner(),
      ) as FIAT

      fiatToken.allowance(address, userProxyAddress).then((allowance) => {
        setFiatInfo({
          allowance,
          approve: () => fiatToken.approve(userProxyAddress, ethers.constants.MaxUint256),
        })
      })
    }
  }, [address, userProxy, userProxyAddress, web3Provider])

  return { address, fiatInfo, userActions, userProxy }
}

export const useManagePositionInfo = () => {
  const {
    query: { positionId }, // TODO Query guard.
  } = useRouter()
  // const { isWalletConnected } = useWeb3Connection()
  // TODO Pass enabled: isWalletConnected && isValidPositionIdType(positionId) && isValidPositionId(positionId)

  return usePosition(positionId as string)
}
