import useUserProxy from './useUserProxy'
import { ZERO_BIG_NUMBER } from '../constants/misc'
import { Contract, ethers } from 'ethers'
import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { contracts } from '@/src/constants/contracts'
import { Chains } from '@/src/constants/chains'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Vault20Actions } from '@/types/typechain'

type ModifyCollateralAndDebt = {
  vault: string
  token: string
  tokenId: number
  deltaCollateral: BigNumber
  deltaNormalDebt: BigNumber
}

export type BaseModify = {
  vault: string
  token: string
  tokenId: number
}

export type DepositCollateral = BaseModify & {
  toDeposit: BigNumber
  toMint: BigNumber
}

export type WithdrawCollateral = BaseModify & {
  toWithdraw: BigNumber
}

export type MintFIAT = BaseModify & {
  toMint: BigNumber
}

export type BurnFIAT = BaseModify & {
  toBurn: BigNumber
  toWithdraw: BigNumber
}

type UseUserActions = {
  userAction: Vault20Actions
  approveFIAT: (to: string) => Promise<void>
  depositCollateral: (arg0: DepositCollateral) => Promise<void>
  withdrawCollateral: (arg0: WithdrawCollateral) => Promise<void>
  mintFIAT: (arg0: MintFIAT) => Promise<void>
  burnFIAT: (arg0: BurnFIAT) => Promise<void>
}

export const useUserActions = (): UseUserActions => {
  const { address, web3Provider } = useWeb3Connection()
  const { userProxy, userProxyAddress } = useUserProxy()

  const userAction = useMemo(() => {
    return new Contract(
      // TODO: add support for UA1155 (??)
      contracts.USER_ACTIONS_20.address[Chains.goerli],
      contracts.USER_ACTIONS_20.abi,
      web3Provider?.getSigner(),
    ) as Vault20Actions
  }, [web3Provider])

  const approveFIAT = useCallback(
    async (to: string) => {
      if (!userProxy) return

      const MAX_AVAILABLE_AMOUNT = ethers.constants.MaxUint256
      const approveFIAT = userAction.interface.encodeFunctionData('approveFIAT', [
        to,
        MAX_AVAILABLE_AMOUNT,
      ])

      const tx = await userProxy.execute(userAction.address, approveFIAT, {
        gasLimit: 1_000_000,
      })
      await tx.wait()
    },
    [userProxy, userAction.address, userAction.interface],
  )

  const modifyCollateralAndDebt = useCallback(
    async (params: ModifyCollateralAndDebt): Promise<void> => {
      // @TODO: it is not possible to use this hook when user is not connected nor have created a Proxy
      if (!address || !userProxy || !userProxyAddress) return

      const modifyCollateralAndDebtEncoded = userAction.interface.encodeFunctionData(
        'modifyCollateralAndDebt',
        [
          params.vault,
          params.token,
          params.tokenId,
          userProxyAddress,
          address,
          address,
          params.deltaCollateral.toFixed(),
          params.deltaNormalDebt.toFixed(),
        ],
      )
      const tx = await userProxy.execute(userAction.address, modifyCollateralAndDebtEncoded, {
        gasLimit: 1_000_000,
      })
      await tx.wait()
    },
    [address, userProxy, userProxyAddress, userAction.address, userAction.interface],
  )

  const depositCollateral = useCallback(
    async (args: DepositCollateral): Promise<void> => {
      await modifyCollateralAndDebt({
        vault: args.vault,
        token: args.token,
        tokenId: args.tokenId,
        deltaCollateral: args.toDeposit,
        deltaNormalDebt: args.toMint,
      })
    },
    [modifyCollateralAndDebt],
  )

  const withdrawCollateral = useCallback(
    async (args: WithdrawCollateral): Promise<void> => {
      await modifyCollateralAndDebt({
        vault: args.vault,
        token: args.token,
        tokenId: args.tokenId,
        deltaCollateral: args.toWithdraw.negated(),
        deltaNormalDebt: ZERO_BIG_NUMBER,
      })
    },
    [modifyCollateralAndDebt],
  )

  const mintFIAT = useCallback(
    async (args: MintFIAT): Promise<void> => {
      await modifyCollateralAndDebt({
        vault: args.vault,
        token: args.token,
        tokenId: args.tokenId,
        deltaCollateral: ZERO_BIG_NUMBER,
        deltaNormalDebt: args.toMint,
      })
    },
    [modifyCollateralAndDebt],
  )

  const burnFIAT = useCallback(
    async (args: BurnFIAT): Promise<void> => {
      await modifyCollateralAndDebt({
        vault: args.vault,
        token: args.token,
        tokenId: args.tokenId,
        deltaCollateral: args.toWithdraw.negated(), // TODO: should not be negated?
        deltaNormalDebt: args.toBurn.negated(),
      })
    },
    [modifyCollateralAndDebt],
  )

  return { userAction, approveFIAT, depositCollateral, withdrawCollateral, mintFIAT, burnFIAT }
}
