import { calculateNormalDebt } from '../utils/data/positions'
import BigNumber from 'bignumber.js'
import { BigNumberish, Contract, ethers } from 'ethers'
import { useCallback, useMemo } from 'react'
import { TransactionResponse } from '@ethersproject/providers'
import { contracts } from '@/src/constants/contracts'
import { useNotifications } from '@/src/hooks/useNotifications'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connected } from '@/src/providers/web3ConnectionProvider'
import { TransactionError } from '@/src/utils/TransactionError'
import { estimateGasLimit } from '@/src/web3/utils'
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
  virtualRate: BigNumber
}

type ModifyCollateralAndDebt = BaseModify & {
  deltaCollateral: BigNumber
  deltaDebt: BigNumber
  virtualRate: BigNumber
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

export const useUserActions = (type?: string): UseUserActions => {
  const { address, appChainId, web3Provider } = useWeb3Connected()
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

  // Notional User Action: ERC1155
  const userActionFC = useMemo(() => {
    return new Contract(
      contracts.USER_ACTIONS_FC.address[appChainId],
      contracts.USER_ACTIONS_FC.abi,
      web3Provider?.getSigner(),
    ) as VaultEPTActions
  }, [web3Provider, appChainId])

  const activeContract = type && type === 'NOTIONAL' ? userActionFC : userActionEPT

  const approveFIAT = useCallback(
    async (to: string) => {
      if (!userProxy) {
        throw new Error('no userProxy defined')
      }

      // TODO: check if vault/protocol type so we can use EPT or FC
      const approveFIAT = activeContract.interface.encodeFunctionData('approveFIAT', [
        to,
        ethers.constants.MaxUint256, // Max available amount
      ])

      notification.requestSign()

      const tx: TransactionResponse | TransactionError = await userProxy
        .execute(activeContract.address, approveFIAT, {
          gasLimit: await estimateGasLimit(userProxy, 'execute', [
            activeContract.address,
            approveFIAT,
          ]),
        })
        .catch(notification.handleTxError)

      if (tx instanceof TransactionError) {
        throw tx
      }

      // awaiting exec
      notification.awaitingTx(tx.hash)

      const receipt = await tx.wait()

      // tx successful
      notification.successfulGenericTx(tx.hash)

      return receipt
    },
    [userProxy, activeContract.interface, activeContract.address, notification],
  )

  const modifyCollateralAndDebt = useCallback(
    async (params: ModifyCollateralAndDebt) => {
      // @TODO: it is not possible to use this hook when user is not connected nor have created a Proxy
      if (!address || !userProxy || !userProxyAddress) {
        throw new Error(`Missing information: ${{ address, userProxy, userProxyAddress }}`)
      }

      // @TODO: toFixed(0, ROUNDED) transforms BigNumber into String without decimals
      const deltaCollateral = params.deltaCollateral.toFixed(0, 8)

      // deltaNormalDebt= deltaDebt / (virtualRate * virtualRateWithSafetyMargin)
      const deltaNormalDebt = calculateNormalDebt(params.deltaDebt, params.virtualRate).toFixed(
        0,
        8,
      )

      // TODO: check if vault/protocol type so we can use EPT or FC
      const modifyCollateralAndDebtEncoded = activeContract.interface.encodeFunctionData(
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
        .execute(activeContract.address, modifyCollateralAndDebtEncoded, {
          gasLimit: await estimateGasLimit(userProxy, 'execute', [
            activeContract.address,
            modifyCollateralAndDebtEncoded,
          ]),
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
      activeContract.interface,
      activeContract.address,
      notification,
    ],
  )

  const buyCollateralAndModifyDebt = useCallback(
    async (params: BuyCollateralAndModifyDebt) => {
      if (!address || !userProxy || !userProxyAddress) {
        throw new Error(`missing information: ${{ address, userProxy, userProxyAddress }}`)
      }

      const buyCollateralAndModifyDebtEncoded = activeContract.interface.encodeFunctionData(
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
        .execute(activeContract.address, buyCollateralAndModifyDebtEncoded, {
          gasLimit: await estimateGasLimit(userProxy, 'execute', [
            activeContract.address,
            buyCollateralAndModifyDebtEncoded,
          ]),
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
      activeContract.interface,
      activeContract.address,
      notification,
    ],
  )

  const depositCollateral = useCallback(
    (params: DepositCollateral) => {
      return modifyCollateralAndDebt({
        ...params,
        deltaCollateral: params.toDeposit,
        deltaDebt: params.toMint,
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
