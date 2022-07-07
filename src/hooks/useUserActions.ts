import { calculateNormalDebt } from '../utils/data/positions'
import { contracts } from '@/src/constants/contracts'
import { useNotifications } from '@/src/hooks/useNotifications'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connected } from '@/src/providers/web3ConnectionProvider'
import { TransactionError } from '@/src/utils/TransactionError'
import { VaultEPTActions, VaultFCActions } from '@/types/typechain'
import { estimateGasLimit } from '@/src/web3/utils'
import { TransactionResponse } from '@ethersproject/providers'
import { BigNumberish, Contract, ethers } from 'ethers'
import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { BytesLike } from '@ethersproject/bytes'

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

type RedeemCollateralAndModifyDebt = BaseModify & {
  deltaCollateral: BigNumber
  deltaDebt: BigNumber
  virtualRate: BigNumber
}

type SellCollateralAndModifyDebt = BaseModify & {
  deltaCollateral: BigNumber
  deltaDebt: BigNumber
  virtualRate: BigNumber
}

type BuyCollateralAndModifyDebtERC1155 = BaseModify & {
  // TODO: regen types so it matches args on VaultFCActions Contract for buyCollateralAndModifyDebt
  // address vault
  // address token
  // uint256 tokenId
  // address position
  // address collateralizer
  // address creditor
  // uint256 fCashAmount
  // int256 deltaNormalDebt
  // uint256 minImpliedRate
  // uint256 underlierAmount

  deltaDebt: BigNumber
  virtualRate: BigNumber
  fCashAmount: BigNumber
  underlierAmount: BigNumber
  minImpliedRate: number
}

type BuyCollateralAndModifyDebtERC20 = {
  vault: string
  deltaDebt: BigNumber
  virtualRate: BigNumber
  underlierAmount: BigNumber
  swapParams: {
    balancerVault: string // Address of the Balancer Vault
    poolId: BytesLike // Id bytes32 of the Element Convergent Curve Pool containing the collateral token
    assetIn: string // Underlier token address when adding collateral and `collateral` when removing
    assetOut: string // Collateral token address when adding collateral and `underlier` when removing
    minOutput: BigNumberish // uint256 Min. amount of tokens we would accept to receive from the swap, whether it is collateral or underlier
    deadline: BigNumberish // uint256 Timestamp at which swap must be confirmed by [seconds]
    approve: BigNumberish // uint256 Amount of `assetIn` to approve for `balancerVault` for swapping `assetIn` for `assetOut`
  }
}

export type UseUserActions = {
  approveFIAT: (to: string) => ReturnType<TransactionResponse['wait']>
  depositCollateral: (params: DepositCollateral) => ReturnType<TransactionResponse['wait']>
  redeemCollateralAndModifyDebt: (
    params: RedeemCollateralAndModifyDebt,
  ) => ReturnType<TransactionResponse['wait']>
  modifyCollateralAndDebt: (
    params: ModifyCollateralAndDebt,
  ) => ReturnType<TransactionResponse['wait']>
  buyCollateralAndModifyDebtERC20: (
    params: BuyCollateralAndModifyDebtERC20,
  ) => ReturnType<TransactionResponse['wait']>
  buyCollateralAndModifyDebtERC1155: (
    params: BuyCollateralAndModifyDebtERC1155,
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

  // Yield User Action: ERC 20
  const userActionFY = useMemo(() => {
    return new Contract(
      contracts.USER_ACTIONS_FY.address[appChainId],
      contracts.USER_ACTIONS_FY.abi,
      web3Provider?.getSigner(),
    ) as VaultEPTActions
  }, [web3Provider, appChainId])

  // Notional User Action: ERC1155
  const userActionFC = useMemo(() => {
    return new Contract(
      contracts.USER_ACTIONS_FC.address[appChainId],
      contracts.USER_ACTIONS_FC.abi,
      web3Provider?.getSigner(),
    ) as VaultFCActions
  }, [web3Provider, appChainId])

  const activeContract =
    type && type === 'NOTIONAL'
      ? (userActionFC as VaultFCActions)
      : type === 'YIELD'
      ? (userActionFY as VaultEPTActions) // TODO: use FY type
      : (userActionEPT as VaultEPTActions)

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

      // deltaNormalDebt = deltaDebt / (virtualRate * virtualRateWithSafetyMargin)
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

  // VaultFCActions buyCollateralAndModifyDebt
  const buyCollateralAndModifyDebtERC1155 = useCallback(
    async (params: BuyCollateralAndModifyDebtERC1155) => {
      if (!address || !userProxy || !userProxyAddress) {
        throw new Error(`missing information: ${{ address, userProxy, userProxyAddress }}`)
      }

      // deltaNormalDebt= deltaDebt / (virtualRate * virtualRateWithSafetyMargin)
      const deltaNormalDebt = calculateNormalDebt(params.deltaDebt, params.virtualRate).toFixed(
        0,
        8,
      )

      // console.log(
      //   '',
      //   88,
      //   '\n',
      //   params.vault,
      //   '\n', // address vault
      //   params.token,
      //   '\n', // address token
      //   params.tokenId,
      //   '\n', // uint256 tokenId
      //   userProxyAddress,
      //   '\n', // address position
      //   address,
      //   '\n', // address collateralizer
      //   address,
      //   '\n', // address creditor
      //   params.fCashAmount.toFixed(0, 8),
      //   '\n', // uint256 fCashAmount
      //   deltaNormalDebt,
      //   '\n', // int256 deltaNormalDebt
      //   params.minImpliedRate,
      //   '\n', // uint32 minImpliedRate
      //   params.underlierAmount.toFixed(0, 8),
      //   '\n', // uint256 maxUnderlierAmount
      // )

      const buyCollateralAndModifyDebtEncoded = userActionFC.interface.encodeFunctionData(
        'buyCollateralAndModifyDebt',
        [
          params.vault, // address vault
          params.token, // address token
          params.tokenId, // uint256 tokenId
          userProxyAddress, // address position
          address, // address collateralizer
          address, // address creditor
          params.fCashAmount.toFixed(0, 8), // uint256 fCashAmount          // I think this is correct, although maybe I need a buffer on the exchange rate (slippage tollerance)
          deltaNormalDebt, // int256 deltaNormalDebt       // I though this was correct, but im getting a transactions reverted when this is non-zero
          params.minImpliedRate, // uint32 minImpliedRate        // Need to update (waiting for Nilus)
          params.underlierAmount.toFixed(0, 8), // uint256 maxUnderlierAmount   // definitely correct
        ],
      )

      console.log(22, activeContract.address)

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
      userActionFC.interface,
      activeContract.address,
      notification,
    ],
  )

  const redeemCollateralAndModifyDebt = useCallback(
    async (params: RedeemCollateralAndModifyDebt) => {
      if (!address || !userProxy || !userProxyAddress) {
        throw new Error(`Missing information: ${{ address, userProxy, userProxyAddress }}`)
      }

      // @TODO: toFixed(0, ROUNDED) transforms BigNumber into String without decimals
      const deltaCollateral = params.deltaCollateral.toFixed(0, 8)

      const deltaNormalDebt = calculateNormalDebt(params.deltaDebt, params.virtualRate).toFixed(
        0,
        8,
      )

      const redeemCollateralAndModifyDebtEncoded = (
        activeContract as VaultEPTActions
      ).interface.encodeFunctionData('redeemCollateralAndModifyDebt', [
        params.vault,
        params.token,
        userProxyAddress,
        address,
        address,
        deltaCollateral,
        deltaNormalDebt,
      ])

      // please sign
      notification.requestSign()

      const tx: TransactionResponse | TransactionError = await userProxy
        .execute(activeContract.address, redeemCollateralAndModifyDebtEncoded, {
          gasLimit: await estimateGasLimit(userProxy, 'execute', [
            activeContract.address,
            redeemCollateralAndModifyDebtEncoded,
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
    [address, userProxy, userProxyAddress, activeContract, notification],
  )

  // VaultEPTActions buyCollateralAndModifyDebt
  const buyCollateralAndModifyDebtERC20 = useCallback(
    async (params: BuyCollateralAndModifyDebtERC20) => {
      if (!address || !userProxy || !userProxyAddress) {
        throw new Error(`missing information: ${{ address, userProxy, userProxyAddress }}`)
      }

      const deltaNormalDebt = calculateNormalDebt(params.deltaDebt, params.virtualRate).toFixed(
        0,
        8,
      )

      // console.log('',88,  '\n',
      //   params.vault, '\n',                        // address vault
      //   userProxyAddress, '\n',                    // address position
      //   address, '\n',                             // address collateralizer
      //   address, '\n',                             // address creditor
      //   params.underlierAmount.toFixed(0,8), '\n', // uint256 underlierAmount,
      //   deltaNormalDebt, '\n',                     // int256 deltaNormalDebt,
      //   params.swapParams, '\n',                   // calldata swapParams
      // )

      const buyCollateralAndModifyDebtEncoded = userActionEPT.interface.encodeFunctionData(
        'buyCollateralAndModifyDebt',
        [
          params.vault, // address vault
          userProxyAddress, // address position
          address, // address collateralizer
          address, // address creditor
          params.underlierAmount.toFixed(0, 8), // uint256 underlierAmount,
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
      userActionEPT.interface,
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
    redeemCollateralAndModifyDebt,
    approveFIAT,
    depositCollateral,
    modifyCollateralAndDebt,
    buyCollateralAndModifyDebtERC20,
    buyCollateralAndModifyDebtERC1155,
  }
}
