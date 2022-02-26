import { usePosition } from './subgraph/usePosition'
import { useTokenDecimalsAndBalance } from './useTokenDecimalsAndBalance'
import { ZERO_BIG_NUMBER } from '../constants/misc'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
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
  const { address, readOnlyAppProvider } = useWeb3Connection()
  const { tokenInfo, updateToken } = useTokenDecimalsAndBalance({
    tokenAddress,
    address,
    readOnlyAppProvider,
  })
  const { approveFIAT, depositCollateral } = useUserActions()
  const [fiatInfo, updateFiat] = useFIATBalance(true)

  const deposit = useCallback(
    async (args: DepositCollateral) => {
      await depositCollateral(args)
      await Promise.all([updateToken(), updateFiat()])
    },
    [depositCollateral, updateToken, updateFiat],
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
  const { address, readOnlyAppProvider } = useWeb3Connection()
  const { userProxyAddress } = useUserProxy()
  const { withdrawCollateral } = useUserActions()
  const [fiatInfo] = useFIATBalance(true)
  const { tokenInfo } = useTokenDecimalsAndBalance({ tokenAddress, address, readOnlyAppProvider })

  const withdraw = useCallback(
    async (args: WithdrawCollateral) => {
      if (!userProxyAddress) return
      await withdrawCollateral(args)
    },
    [userProxyAddress, withdrawCollateral],
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
  hasAllowance: boolean
}

export const useBurnForm = ({ tokenAddress }: { tokenAddress?: string }): UseBurnForm => {
  const { address, appChainId, readOnlyAppProvider } = useWeb3Connection()
  const { approveFIAT, burnFIAT } = useUserActions()
  const { userProxyAddress } = useUserProxy()
  const [hasAllowance, setHasAllowance] = useState<boolean>(false)

  const { tokenInfo } = useTokenDecimalsAndBalance({ address, readOnlyAppProvider, tokenAddress })
  const [fiatInfo, updateFiat] = useFIATBalance(true)
  const MONETA = contracts.MONETA.address[appChainId]
  const [fiatAllowance] = useContractCall(
    contracts.FIAT.address[appChainId],
    contracts.FIAT.abi,
    'allowance',
    [userProxyAddress, MONETA],
  )
  const approveToken = useCallback(async () => {
    await approveFIAT(MONETA)
    setHasAllowance(true)
  }, [approveFIAT, MONETA])

  useEffect(() => {
    setHasAllowance(!!fiatAllowance && fiatAllowance?.gt(ZERO_BIG_NUMBER))
  }, [fiatAllowance])

  return {
    fiatInfo,
    fiatAllowance,
    updateFiat,
    burn: burnFIAT,
    tokenInfo,
    approveToken,
    hasAllowance,
  }
}

export const useManagePositionInfo = () => {
  const positionId = useQueryParam('positionId')

  // const { isWalletConnected } = useWeb3Connection()
  // TODO Pass enabled: isWalletConnected && isValidPositionIdType(positionId) && isValidPositionId(positionId)

  return usePosition(positionId as string)
}
