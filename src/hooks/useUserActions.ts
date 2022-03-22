import { TransactionResponse } from '@ethersproject/providers'
import { BigNumberish, Contract, ethers } from 'ethers'
import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import useUserProxy from '@/src/hooks/useUserProxy'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { contracts } from '@/src/constants/contracts'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { VaultEPTActions } from '@/types/typechain'

type ModifyCollateralAndDebt = {
  vault: string
  token: string
  tokenId: number
  deltaCollateral: BigNumber
  deltaNormalDebt: BigNumber
}

type BuyCollateralAndModifyDebt = {
  vault: string
  position: string
  collateralizer: string
  creditor: string
  underlierAmount: BigNumberish
  deltaNormalDebt: BigNumberish
  swapParams: {
    balancerVault: string
    poolId: string
    assetIn: string
    assetOut: string
    minOutput: BigNumberish
    deadline: BigNumberish
    approve: BigNumberish
  }
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

type MintFIAT = BaseModify & {
  toMint: BigNumber
}

type BurnFIAT = BaseModify & {
  toBurn: BigNumber
  toWithdraw: BigNumber
}

export type UseUserActions = {
  approveFIAT: (to: string) => ReturnType<TransactionResponse['wait']>
  depositCollateral: (params: DepositCollateral) => ReturnType<TransactionResponse['wait']>
  withdrawCollateral: (params: WithdrawCollateral) => ReturnType<TransactionResponse['wait']>
  mintFIAT: (params: MintFIAT) => ReturnType<TransactionResponse['wait']>
  burnFIAT: (params: BurnFIAT) => ReturnType<TransactionResponse['wait']>
  modifyCollateralAndDebt: (
    params: ModifyCollateralAndDebt,
  ) => ReturnType<TransactionResponse['wait']>
  buyCollateralAndModifyDebt: (
    params: BuyCollateralAndModifyDebt,
  ) => ReturnType<TransactionResponse['wait']>
}

export const useUserActions = (): UseUserActions => {
  const { address, appChainId, web3Provider } = useWeb3Connection()
  const { userProxy, userProxyAddress } = useUserProxy()

  // Element User Action: ERC20
  const userActionEPT = useMemo(() => {
    return new Contract(
      contracts.USER_ACTIONS_EPT.address[appChainId],
      contracts.USER_ACTIONS_EPT.abi,
      web3Provider?.getSigner(),
    ) as VaultEPTActions
  }, [web3Provider, appChainId])

  const approveFIAT = useCallback(
    async (to: string) => {
      if (!userProxy) {
        throw new Error('no userProxy defined')
      }

      // TODO: check if vault/protocol type so we can use EPT or FC
      const approveFIAT = userActionEPT.interface.encodeFunctionData('approveFIAT', [
        to,
        ethers.constants.MaxUint256, // Max available amount
      ])

      const tx: TransactionResponse = await userProxy.execute(userActionEPT.address, approveFIAT, {
        gasLimit: 1_000_000,
      })

      return tx.wait()
    },
    [userProxy, userActionEPT.address, userActionEPT.interface],
  )

  const modifyCollateralAndDebt = useCallback(
    async (params: ModifyCollateralAndDebt) => {
      // @TODO: it is not possible to use this hook when user is not connected nor have created a Proxy
      if (!address || !userProxy || !userProxyAddress) {
        throw new Error(`missing information: ${{ address, userProxy, userProxyAddress }}`)
      }

      // @TODO: toFixed(0, ROUNDED) transforms BigNumber into String without decimals
      const deltaCollateral = params.deltaCollateral.toFixed(0, 8)
      const deltaNormalDebt = params.deltaNormalDebt.toFixed(0, 8)
      // TODO: check if vault/protocol type so we can use EPT or FC
      const modifyCollateralAndDebtEncoded = userActionEPT.interface.encodeFunctionData(
        'modifyCollateralAndDebt',
        [
          params.vault,
          params.token,
          params.tokenId,
          userProxyAddress,
          address,
          address,
          deltaCollateral,
          deltaNormalDebt,
        ],
      )
      const tx: TransactionResponse = await userProxy.execute(
        userActionEPT.address,
        modifyCollateralAndDebtEncoded,
        {
          gasLimit: 1_000_000,
        },
      )

      return tx.wait()
    },
    [address, userProxy, userProxyAddress, userActionEPT.address, userActionEPT.interface],
  )

  const buyCollateralAndModifyDebt = useCallback(
    async (params: BuyCollateralAndModifyDebt) => {
      if (!address || !userProxy || !userProxyAddress) {
        throw new Error(`missing information: ${{ address, userProxy, userProxyAddress }}`)
      }

      const buyCollateralAndModifyDebtEncoded = userActionEPT.interface.encodeFunctionData(
        'buyCollateralAndModifyDebt',
        [
          params.vault,
          params.position,
          params.collateralizer,
          params.creditor,
          params.underlierAmount,
          params.deltaNormalDebt,
          params.swapParams,
        ],
      )
      const tx: TransactionResponse = await userProxy.execute(
        userActionEPT.address,
        buyCollateralAndModifyDebtEncoded,
        {
          gasLimit: 1_000_000,
        },
      )

      return tx.wait()
    },
    [address, userProxy, userProxyAddress, userActionEPT.interface, userActionEPT.address],
  )

  const depositCollateral = useCallback(
    (params: DepositCollateral) => {
      return modifyCollateralAndDebt({
        vault: params.vault,
        token: params.token,
        tokenId: params.tokenId,
        deltaCollateral: params.toDeposit,
        deltaNormalDebt: params.toMint,
      })
    },
    [modifyCollateralAndDebt],
  )

  const withdrawCollateral = useCallback(
    (params: WithdrawCollateral) => {
      return modifyCollateralAndDebt({
        vault: params.vault,
        token: params.token,
        tokenId: params.tokenId,
        deltaCollateral: params.toWithdraw.negated(),
        deltaNormalDebt: ZERO_BIG_NUMBER,
      })
    },
    [modifyCollateralAndDebt],
  )

  const mintFIAT = useCallback(
    (params: MintFIAT) => {
      return modifyCollateralAndDebt({
        vault: params.vault,
        token: params.token,
        tokenId: params.tokenId,
        deltaCollateral: ZERO_BIG_NUMBER,
        deltaNormalDebt: params.toMint,
      })
    },
    [modifyCollateralAndDebt],
  )

  const burnFIAT = useCallback(
    (params: BurnFIAT) => {
      return modifyCollateralAndDebt({
        vault: params.vault,
        token: params.token,
        tokenId: params.tokenId,
        deltaCollateral: params.toWithdraw.negated(), // TODO: should not be negated?
        deltaNormalDebt: params.toBurn.negated(),
      })
    },
    [modifyCollateralAndDebt],
  )
  return {
    approveFIAT,
    modifyCollateralAndDebt,
    depositCollateral,
    withdrawCollateral,
    mintFIAT,
    burnFIAT,
    buyCollateralAndModifyDebt,
  }
}
