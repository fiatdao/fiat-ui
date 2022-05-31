import { calculateNormalDebt } from '../utils/data/positions'
import { getVirtualRate } from '../utils/getVirtualRate'
import { TransactionResponse } from '@ethersproject/providers'
import { BigNumberish, Contract, ethers } from 'ethers'
import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { useNotifications } from '@/src/hooks/useNotifications'
import { TransactionError } from '@/src/utils/TransactionError'
import useUserProxy from '@/src/hooks/useUserProxy'
import { contracts } from '@/src/constants/contracts'
import { useWeb3Connected } from '@/src/providers/web3ConnectionProvider'
import { VaultEPTActions } from '@/types/typechain'
import { estimateGasLimit } from '@/src/web3/utils'
import { WAD_DECIMALS } from '@/src/constants/misc'

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
  deltaDebt: BigNumber
  virtualRate?: BigNumber
}

type BuyCollateralAndModifyDebtNotional = BaseModify & {
  deltaDebt: BigNumber
  virtualRate?: BigNumber
  underlierAmount: BigNumber
}

type BuyCollateralAndModifyDebtElement = {
  vault: string
  deltaDebt: BigNumber
  virtualRate?: BigNumber
  underlierAmount: BigNumber
  swapParams: {
    balancerVault: string // Address of the Balancer Vault
    poolId: string // Id bytes32 of the Element Convergent Curve Pool containing the collateral token
    assetIn: string// Underlier token address when adding collateral and `collateral` when removing
    assetOut: string // Collateral token address when adding collateral and `underlier` when removing
    minOutput?: string // uint256 Min. amount of tokens we would accept to receive from the swap, whether it is collateral or underlier
    deadline: BigNumberish // uint256 Timestamp at which swap must be confirmed by [seconds]
    approve: string // uint256 Amount of `assetIn` to approve for `balancerVault` for swapping `assetIn` for `assetOut`
  }
}

export type UseUserActions = {
  approveFIAT: (to: string) => ReturnType<TransactionResponse['wait']>
  depositCollateral: (params: DepositCollateral) => ReturnType<TransactionResponse['wait']>
  modifyCollateralAndDebt: (
    params: ModifyCollateralAndDebt,
  ) => ReturnType<TransactionResponse['wait']>
  buyCollateralAndModifyDebtElement: (
    params: BuyCollateralAndModifyDebtElement,
  ) => ReturnType<TransactionResponse['wait']>
  buyCollateralAndModifyDebtNotional: (
    params: BuyCollateralAndModifyDebtNotional,
  ) => ReturnType<TransactionResponse['wait']>
}

export const useUserActions = (type?: string): UseUserActions => {
  const { address, appChainId, web3Provider } = useWeb3Connected()
  const { userProxy, userProxyAddress } = useUserProxy()
  const notification = useNotifications()

  const _getVirtualRate = useCallback(
    (vaultAddress: string) => {
      return getVirtualRate(vaultAddress, appChainId, web3Provider)
    },
    [appChainId, web3Provider],
  )

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
        throw new Error(`missing information: ${{ address, userProxy, userProxyAddress }}`)
      }

      // @TODO: toFixed(0, ROUNDED) transforms BigNumber into String without decimals
      const deltaCollateral = params.deltaCollateral.toFixed(0, 8)
      if (!params.virtualRate) {
        params.virtualRate = await _getVirtualRate(params.vault)
      }
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
      _getVirtualRate,
    ],
  )

  // VaultFCActions buyCollateralAndModifyDebt
  const buyCollateralAndModifyDebtNotional = useCallback(
    async (params: BuyCollateralAndModifyDebtNotional) => {
      if (!address || !userProxy || !userProxyAddress) {
        throw new Error(`missing information: ${{ address, userProxy, userProxyAddress }}`)
      }

      if (!params.virtualRate) {
        params.virtualRate = await _getVirtualRate(params.vault)
      }

      // deltaNormalDebt= deltaDebt / (virtualRate * virtualRateWithSafetyMargin)
      const deltaNormalDebt = calculateNormalDebt(params.deltaDebt, params.virtualRate).toFixed(
        0,
        8,
      )

      const fCashAmount = params.underlierAmount // probably needs to be multiplied by virtual rate

      const buyCollateralAndModifyDebtEncoded = activeContract.interface.encodeFunctionData(
        'buyCollateralAndModifyDebt',
        [

          params.vault, // address vault
          params.token, // address token
          params.tokenId, // uint256 tokenId
          userProxyAddress, // address position
          address, // address collateralizer
          address, // address creditor
          fCashAmount, // uint256 fCashAmount                     
          deltaNormalDebt, // int256 deltaNormalDebt
          // minImpliedRate, // uint32 minImpliedRate                //need to update
          params.underlierAmount // uint256 maxUnderlierAmount
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
      _getVirtualRate
    ],
  )

  // VaultEPTActions buyCollateralAndModifyDebt
  const buyCollateralAndModifyDebtElement = useCallback(
    async (params: BuyCollateralAndModifyDebtElement) => {
      if (!address || !userProxy || !userProxyAddress) {
        throw new Error(`missing information: ${{ address, userProxy, userProxyAddress }}`)
      }

      if (!params.virtualRate) {
        params.virtualRate = await _getVirtualRate(params.vault)
      }

      // deltaNormalDebt= deltaDebt / (virtualRate * virtualRateWithSafetyMargin)
      const deltaNormalDebt = calculateNormalDebt(params.deltaDebt, params.virtualRate).toFixed(
        0,
        8,
      )

      // console.log('',88,  '\n',         
      //   params.vault, '\n',// address vault
      //   userProxyAddress, '\n',// address position
      //   address, '\n',// address collateralizer
      //   address, '\n',// address creditor
      //   params.underlierAmount.unscaleBy(WAD_DECIMALS).toNumber(), '\n',// uint256 underlierAmount,
      //   deltaNormalDebt, '\n',// int256 deltaNormalDebt,
      //   params.swapParams, '\n',// calldata swapParams
      // )

      const buyCollateralAndModifyDebtEncoded = activeContract.interface.encodeFunctionData(
        'buyCollateralAndModifyDebt',
        [

          params.vault, // address vault
          userProxyAddress, // address position
          address, // address collateralizer
          address, // address creditor
          params.underlierAmount.unscaleBy(WAD_DECIMALS).toNumber(), // uint256 underlierAmount,
          deltaNormalDebt, // int256 deltaNormalDebt,
          params.swapParams, // calldata swapParams
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
      _getVirtualRate
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
    buyCollateralAndModifyDebtElement,
    buyCollateralAndModifyDebtNotional,

  }
}
