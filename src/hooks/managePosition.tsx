import { usePosition } from './subgraph/usePosition'
import { useTokenDecimalsAndBalance } from './useTokenDecimalsAndBalance'
import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import { KeyedMutator } from 'swr'
import { useQueryParam } from '@/src/hooks/useQueryParam'
import { useFIATBalance } from '@/src/hooks/useFIATBalance'
import { contracts } from '@/src/constants/contracts'
import {
  DepositCollateral,
  MintFIAT,
  WithdrawCollateral,
  useUserActions,
} from '@/src/hooks/useUserActions'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import useContractCall from '@/src/hooks/contracts/useContractCall'

export type TokenInfo = {
  decimals?: number
  humanValue?: BigNumber
}

type UseDepositForm = {
  tokenInfo?: TokenInfo
  fiatInfo?: BigNumber
  deposit: (args: DepositCollateral) => Promise<void>
  approve: (arg0: string) => Promise<void>
}

export const useDepositForm = ({ tokenAddress }: { tokenAddress: string }): UseDepositForm => {
  const { address, appChainId, readOnlyAppProvider } = useWeb3Connection()
  const { userProxyAddress } = useUserProxy()
  const { tokenInfo, updateToken } = useTokenDecimalsAndBalance({
    tokenAddress,
    address,
    readOnlyAppProvider,
  })
  const { approveFIAT, depositCollateral } = useUserActions()
  const [fiatAllowance] = useContractCall(
    contracts.FIAT.address[appChainId],
    contracts.FIAT.abi,
    'allowance',
    [address, userProxyAddress],
  )
  const [fiatInfo, updateFiat] = useFIATBalance(true)

  const deposit = useCallback(
    async (args: DepositCollateral) => {
      if (!userProxyAddress) return
      if (fiatAllowance?.lt(args.toDeposit.toFixed())) {
        await approveFIAT(userProxyAddress)
      }
      await depositCollateral(args)
      await Promise.all([updateToken(), updateFiat()])
    },
    [userProxyAddress, approveFIAT, depositCollateral, fiatAllowance, updateFiat, updateToken],
  )

  return {
    tokenInfo,
    fiatInfo,
    deposit,
    approve: approveFIAT,
  }
}

type UseWithdrawForm = {
  tokenInfo?: TokenInfo
  fiatInfo: BigNumber
  withdraw: (args: WithdrawCollateral) => Promise<void>
}

export const useWithdrawForm = ({ tokenAddress }: { tokenAddress?: string }): UseWithdrawForm => {
  const { address, appChainId, readOnlyAppProvider } = useWeb3Connection()
  const { userProxyAddress } = useUserProxy()
  const { approveFIAT, withdrawCollateral } = useUserActions()
  const [fiatInfo] = useFIATBalance(true)
  const { tokenInfo } = useTokenDecimalsAndBalance({ tokenAddress, address, readOnlyAppProvider })
  const [fiatAllowance] = useContractCall(
    contracts.FIAT.address[appChainId],
    contracts.FIAT.abi,
    'allowance',
    [address, userProxyAddress],
  )
  const withdraw = useCallback(
    async (args: WithdrawCollateral) => {
      if (!userProxyAddress) return
      if (fiatAllowance?.lt(args.toWithdraw.toFixed())) {
        await approveFIAT(userProxyAddress)
      }
      await withdrawCollateral(args)
    },
    [userProxyAddress, approveFIAT, withdrawCollateral, fiatAllowance],
  )

  return { tokenInfo, fiatInfo, withdraw }
}

type UseMintForm = {
  fiatInfo?: BigNumber
  updateFiat: KeyedMutator<any>
  mint: (args: MintFIAT) => Promise<void>
}

export const useMintForm = (): UseMintForm => {
  const { mintFIAT } = useUserActions()
  const [fiatInfo, updateFiat] = useFIATBalance(true)

  return { fiatInfo, updateFiat, mint: mintFIAT }
}

type BurnFiat = {
  vault: string
  token: string
  tokenId: number
  toWithdraw: BigNumber
  toBurn: BigNumber
}

type UseBurnForm = {
  tokenInfo?: TokenInfo
  fiatInfo?: BigNumber
  approveToken: () => Promise<any>
  burn: (args: BurnFiat) => Promise<any>
  updateFiat: () => Promise<any>
  fiatAllowance?: BigNumber
}

export const useBurnForm = ({ tokenAddress }: { tokenAddress?: string }): UseBurnForm => {
  const { address, appChainId, readOnlyAppProvider } = useWeb3Connection()
  const { approveFIAT, burnFIAT } = useUserActions()
  const { userProxyAddress } = useUserProxy()

  const { tokenInfo } = useTokenDecimalsAndBalance({ address, readOnlyAppProvider, tokenAddress })
  const [fiatInfo, updateFiat] = useFIATBalance(true)
  const [fiatAllowance] = useContractCall(
    contracts.FIAT.address[appChainId],
    contracts.FIAT.abi,
    'allowance',
    [address, userProxyAddress],
  )
  const approveToken = useCallback(async () => {
    const MONETA = contracts.MONETA.address[appChainId]
    await approveFIAT(MONETA)
  }, [appChainId, approveFIAT])

  return {
    fiatInfo,
    fiatAllowance,
    updateFiat,
    burn: burnFIAT,
    tokenInfo,
    approveToken,
  }
}

export const useManagePositionInfo = () => {
  const positionId = useQueryParam('positionId')

  // const { isWalletConnected } = useWeb3Connection()
  // TODO Pass enabled: isWalletConnected && isValidPositionIdType(positionId) && isValidPositionId(positionId)

  return usePosition(positionId as string)
}
