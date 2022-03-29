import { TransactionResponse } from '@ethersproject/providers'
import { BigNumberish, Contract, ethers } from 'ethers'
import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { useNotifications } from '@/src/hooks/useNotifications'
import { TransactionError } from '@/src/utils/TransactionError'
import useUserProxy from '@/src/hooks/useUserProxy'
import { contracts } from '@/src/constants/contracts'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { VaultEPTActions } from '@/types/typechain'

type BaseModify = {
  vault: string
  token: string
  tokenId: number
  wait?: number
}

type DepositCollateral = BaseModify & {
  toDeposit: BigNumber
  toMint: BigNumber
}

type ModifyCollateralAndDebt = BaseModify & {
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

export type UseUserActions = {
  approveFIAT: (to: string) => ReturnType<TransactionResponse['wait']>
  depositCollateral: (params: DepositCollateral) => ReturnType<TransactionResponse['wait']>
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
  const notification = useNotifications()

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

      notification.requestSign()

      const tx: TransactionResponse | TransactionError = await userProxy
        .execute(userActionEPT.address, approveFIAT, {
          gasLimit: 1_000_000,
        })
        .catch(notification.handleTxError)

      if (tx instanceof TransactionError) {
        throw tx
      }

      // awaiting exec
      notification.awaitingTx(tx.hash)

      const receipt = await tx.wait()

      // tx successful
      notification.successfulTx(tx.hash)

      return receipt
    },
    [userProxy, userActionEPT.interface, userActionEPT.address, notification],
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

      // please sign
      notification.requestSign()

      const tx: TransactionResponse | TransactionError = await userProxy
        .execute(userActionEPT.address, modifyCollateralAndDebtEncoded, {
          gasLimit: 1_000_000,
        })
        .catch(notification.handleTxError)

      if (tx instanceof TransactionError) {
        throw tx
      }

      // awaiting exec
      if (params.wait) {
        notification.awaitingTxBlocks(tx.hash, params.wait)
      } else {
        notification.awaitingTx(tx.hash)
      }

      const receipt = await tx.wait(params.wait).catch(notification.handleTxError)

      if (receipt instanceof TransactionError) {
        throw receipt
      }

      // tx successful
      notification.successfulTx(tx.hash)

      return receipt
    },
    [
      address,
      userProxy,
      userProxyAddress,
      userActionEPT.interface,
      userActionEPT.address,
      notification,
    ],
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

      // please sign
      notification.requestSign()

      const tx: TransactionResponse | TransactionError = await userProxy
        .execute(userActionEPT.address, buyCollateralAndModifyDebtEncoded, {
          gasLimit: 1_000_000,
        })
        .catch(notification.handleTxError)

      if (tx instanceof TransactionError) {
        throw tx
      }

      // awaiting exec
      notification.awaitingTx(tx.hash)

      const receipt = await tx.wait().catch(notification.handleTxError)

      if (receipt instanceof TransactionError) {
        throw receipt
      }

      // tx successful
      notification.successfulTx(tx.hash)

      return receipt
    },
    [
      address,
      userProxy,
      userProxyAddress,
      userActionEPT.interface,
      userActionEPT.address,
      notification,
    ],
  )

  const depositCollateral = useCallback(
    (params: DepositCollateral) => {
      return modifyCollateralAndDebt({
        ...params,
        deltaCollateral: params.toDeposit,
        deltaNormalDebt: params.toMint,
      })
    },
    [modifyCollateralAndDebt],
  )

  return {
    approveFIAT,
    depositCollateral,
    modifyCollateralAndDebt,
    buyCollateralAndModifyDebt,
  }
}
