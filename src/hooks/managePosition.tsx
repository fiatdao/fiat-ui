import { usePosition } from './subgraph/usePosition'
import { useTokenDecimalsAndBalance } from './useTokenDecimalsAndBalance'
import { useERC20Allowance } from './useERC20Allowance'
import { WAD_DECIMALS, ZERO_BIG_NUMBER } from '../constants/misc'
import BigNumber from 'bignumber.js'
import { useCallback, useEffect, useState } from 'react'
import { KeyedMutator } from 'swr'
import { DepositFormFields } from '@/src/components/custom/manage-position/DepositForm'
import { contracts } from '@/src/constants/contracts'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { useFIATBalance } from '@/src/hooks/useFIATBalance'
import { useQueryParam } from '@/src/hooks/useQueryParam'
import {
  DepositCollateral,
  MintFIAT,
  WithdrawCollateral,
  useUserActions,
} from '@/src/hooks/useUserActions'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Position } from '@/src/utils/data/positions'
import { getCurrentValue } from '@/src/utils/getCurrentValue'
import { getHumanValue } from '@/src/web3/utils'
import { BurnFormFields } from '@/src/components/custom/manage-position/BurnForm'

export type TokenInfo = {
  decimals?: number
  humanValue?: BigNumber
}

type UseDepositForm = {
  currentValue: BigNumber
  tokenInfo?: TokenInfo
  fiatInfo?: BigNumber
  deposit: (args: DepositCollateral) => Promise<void>
  approve: (arg0: string) => Promise<void>
}

export const useDepositForm = ({
  tokenAddress,
  vaultAddress,
}: {
  tokenAddress: string
  vaultAddress: string
}): UseDepositForm => {
  const { address, appChainId, readOnlyAppProvider } = useWeb3Connection()
  const [currentValue, setCurrentValue] = useState(ZERO_BIG_NUMBER)

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

  useEffect(() => {
    let isMounted = true
    getCurrentValue(readOnlyAppProvider, appChainId, 0, vaultAddress, false).then((val) => {
      if (isMounted) setCurrentValue(val)
    })
    return () => {
      isMounted = false
    }
  }, [appChainId, vaultAddress, readOnlyAppProvider, setCurrentValue])

  return {
    currentValue,
    tokenInfo,
    fiatInfo,
    deposit,
    approve: approveFIAT,
  }
}

export const useDepositFormSummary = (
  position: Position,
  { deposit = ZERO_BIG_NUMBER, fiatAmount = ZERO_BIG_NUMBER }: DepositFormFields,
) => {
  return [
    {
      title: 'Current collateral deposited',
      value: getHumanValue(position.totalCollateral, WAD_DECIMALS).toFixed(3),
    },
    {
      title: 'New collateral deposited',
      value: getHumanValue(position.totalCollateral, WAD_DECIMALS).plus(deposit).toFixed(3),
    },
    {
      title: 'Outstanding FIAT debt',
      value: fiatAmount.toFixed(3),
    },
    {
      title: 'New FIAT debt',
      value: getHumanValue(position.totalNormalDebt, WAD_DECIMALS).plus(fiatAmount).toFixed(3),
    },
  ]
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
  burn: (args: BurnFiat) => Promise<any>
  updateFiat: () => Promise<any>
  fiatAllowance?: BigNumber
  hasMonetaAllowance: boolean
  approveMonetaAllowance: () => Promise<any>
  hasFiatAllowance: boolean
  approveFiatAllowance: () => Promise<any>
}

export const useBurnForm = ({ tokenAddress }: { tokenAddress?: string }): UseBurnForm => {
  const { address, appChainId, readOnlyAppProvider } = useWeb3Connection()
  const { approveFIAT, burnFIAT } = useUserActions()
  const { userProxyAddress } = useUserProxy()
  const [hasMonetaAllowance, setHasMonetaAllowance] = useState<boolean>(false)

  const { tokenInfo } = useTokenDecimalsAndBalance({ address, readOnlyAppProvider, tokenAddress })
  const [fiatInfo, updateFiat] = useFIATBalance(true)
  const FIAT = contracts.FIAT.address[appChainId]
  const MONETA = contracts.MONETA.address[appChainId]

  // UserActionContract: approveFiat Moneta to be able to return FIAT to EOA
  const [monetaFiatAllowance] = useContractCall(
    contracts.FIAT.address[appChainId],
    contracts.FIAT.abi,
    'allowance',
    [userProxyAddress, MONETA],
  )

  const approveMonetaAllowance = useCallback(async () => {
    const MONETA = contracts.MONETA.address[appChainId]
    await approveFIAT(MONETA)
    setHasMonetaAllowance(true)
  }, [approveFIAT, appChainId])

  // FIAT Contract: approve Proxy to manage EOA's FIAT
  const { approve: approveFiatAllowance, hasAllowance: hasFiatAllowance } = useERC20Allowance(
    FIAT ?? '',
    userProxyAddress ?? '',
  )

  useEffect(() => {
    setHasMonetaAllowance(!!monetaFiatAllowance && monetaFiatAllowance?.gt(ZERO_BIG_NUMBER))
  }, [monetaFiatAllowance])

  return {
    fiatInfo,
    updateFiat,
    burn: burnFIAT,
    tokenInfo,
    approveMonetaAllowance,
    hasMonetaAllowance,
    approveFiatAllowance,
    hasFiatAllowance,
  }
}

export const useBurnFormSummary = (
  position: Position,
  { burn = ZERO_BIG_NUMBER, withdraw = ZERO_BIG_NUMBER }: BurnFormFields,
) => {
  return [
    {
      title: 'Current collateral deposited',
      value: getHumanValue(position.totalCollateral, WAD_DECIMALS).toFixed(3),
    },
    {
      title: 'New collateral deposited',
      value: getHumanValue(position.totalCollateral, WAD_DECIMALS).minus(withdraw).toFixed(3),
    },
    {
      title: 'Outstanding FIAT debt',
      value: burn.negated().toFixed(3),
    },
    {
      title: 'New FIAT debt',
      value: getHumanValue(position.totalNormalDebt, WAD_DECIMALS).minus(burn).toFixed(3),
    },
  ]
}

export const useManagePositionForm = (position: Position | undefined) => {
  const { address, appChainId, readOnlyAppProvider } = useWeb3Connection()
  const { approveFIAT, burnFIAT, depositCollateral } = useUserActions()
  const { userProxyAddress } = useUserProxy()
  const [hasAllowance, setHasAllowance] = useState<boolean>(false)
  const { withdrawCollateral } = useUserActions()
  const [fairPrice, setFairPrice] = useState(ZERO_BIG_NUMBER)
  const [hasMonetaAllowance, setHasMonetaAllowance] = useState<boolean>(false)
  console.log(hasMonetaAllowance)
  const tokenAddress = position?.collateral.address
  const vaultAddress = position?.protocolAddress

  const { tokenInfo, updateToken } = useTokenDecimalsAndBalance({
    address,
    readOnlyAppProvider,
    tokenAddress,
  })
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

  const withdraw = useCallback(
    async (args: WithdrawCollateral) => {
      if (!userProxyAddress) return
      await withdrawCollateral(args)
    },
    [userProxyAddress, withdrawCollateral],
  )

  useEffect(() => {
    let isMounted = true
    getCurrentValue(readOnlyAppProvider, appChainId, 0, vaultAddress as string, false).then(
      (val) => {
        if (isMounted) setFairPrice(val)
      },
    )
    return () => {
      isMounted = false
    }
  }, [appChainId, vaultAddress, readOnlyAppProvider, setFairPrice])

  const deposit = useCallback(
    async (args: DepositCollateral) => {
      await depositCollateral(args)
      await Promise.all([updateToken(), updateFiat()])
    },
    [depositCollateral, updateToken, updateFiat],
  )

  const calculateMaxFiatValue = (amountToDeposit?: BigNumber) => {
    if (amountToDeposit) {
      const FACTOR = position?.vaultCollateralizationRatio || 1

      return amountToDeposit
        .plus(position?.totalCollateral.unscaleBy(WAD_DECIMALS) as BigNumber)
        .dividedBy(FACTOR)
        .decimalPlaces(contracts.FIAT.decimals)
    }
    return ZERO_BIG_NUMBER
  }

  console.log(calculateMaxFiatValue)

  const { approve: approveFiatAllowance, hasAllowance: hasFiatAllowance } = useERC20Allowance(
    contracts.FIAT.address[appChainId] ?? '',
    userProxyAddress ?? '',
  )

  const [monetaFiatAllowance] = useContractCall(
    contracts.FIAT.address[appChainId],
    contracts.FIAT.abi,
    'allowance',
    [userProxyAddress, MONETA],
  )

  useEffect(() => {
    setHasMonetaAllowance(!!monetaFiatAllowance && monetaFiatAllowance?.gt(ZERO_BIG_NUMBER))
  }, [monetaFiatAllowance])

  const approveMonetaAllowance = useCallback(async () => {
    const MONETA = contracts.MONETA.address[appChainId]
    await approveFIAT(MONETA)
    setHasMonetaAllowance(true)
  }, [approveFIAT, appChainId])

  const handleFormChange = (args: any) => {
    console.log(args)
  }

  const maxWithdrawValue = position?.totalCollateral.minus(
    position?.totalNormalDebt
      .times(position?.vaultCollateralizationRatio || 1)
      .div(position.collateralValue),
  )

  const maxMintValue = position?.totalCollateral.div(position?.vaultCollateralizationRatio ?? 1)

  return {
    fiatInfo,
    fiatAllowance,
    updateFiat,
    burn: burnFIAT,
    tokenInfo,
    approveToken,
    hasAllowance,
    withdraw,
    fairPrice,
    deposit,
    approveMonetaAllowance,
    monetaFiatAllowance,
    approveFiatAllowance,
    hasFiatAllowance,
    maxFiatValue: ZERO_BIG_NUMBER,
    maxCollateralValue: ZERO_BIG_NUMBER,
    maxWithdrawValue,
    maxBurnValue: ZERO_BIG_NUMBER,
    maxMintValue,
    healthFactor: 0,
    handleFormChange,
  }
}

export const useManagePositionInfo = () => {
  const positionId = useQueryParam('positionId')

  // const { isWalletConnected } = useWeb3Connection()
  // TODO Pass enabled: isWalletConnected && isValidPositionIdType(positionId) && isValidPositionId(positionId)

  return usePosition(positionId as string)
}
