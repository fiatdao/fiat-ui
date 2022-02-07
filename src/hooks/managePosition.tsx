import { usePosition } from './subgraph/usePosition'
import { BigNumber as EthersBN } from '@ethersproject/bignumber'
import { Contract, ContractTransaction } from '@ethersproject/contracts'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Chains } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { useUserActions } from '@/src/hooks/useUserActions'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { getHumanValue } from '@/src/web3/utils'
import { ERC20, FIAT, Vault20 } from '@/types/typechain'

export const useDepositForm = ({ tokenAddress }: { tokenAddress: string }) => {
  const { address, readOnlyAppProvider } = useWeb3Connection()
  const userActions = useUserActions()
  const { userProxy } = useUserProxy()

  const [tokenInfo, setTokenInfo] = useState<{
    decimals?: number
    humanValue?: BigNumber
  }>()

  useEffect(() => {
    if (address) {
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

  return { address, tokenInfo, userActions, userProxy }
}

export const useWithdrawForm = ({ vaultAddress }: { vaultAddress: string }) => {
  const { address, readOnlyAppProvider } = useWeb3Connection()
  const userActions = useUserActions()
  const { userProxy } = useUserProxy()

  const [vaultInfo, setVaultInfo] = useState<{ decimals?: number }>()

  useEffect(() => {
    if (address) {
      const vault = new Contract(
        vaultAddress, // TODO: differentiate between Vault20 and Vault1155??
        contracts.VAULT_20.abi,
        readOnlyAppProvider,
      ) as Vault20

      vault.dec().then((decimals) => {
        setVaultInfo({ decimals: decimals.toNumber() })
      })
    }
  }, [address, readOnlyAppProvider, vaultAddress])

  return { address, userActions, userProxy, vaultInfo }
}

export const useMintForm = ({ vaultAddress }: { vaultAddress: string }) => {
  const { address, readOnlyAppProvider } = useWeb3Connection()
  const userActions = useUserActions()
  const { userProxy } = useUserProxy()

  const [vaultInfo, setVaultInfo] = useState<{ decimals?: number }>()

  useEffect(() => {
    if (address) {
      const vault = new Contract(
        vaultAddress, // TODO: differentiate between Vault20 and Vault1155??
        contracts.VAULT_20.abi,
        readOnlyAppProvider,
      ) as Vault20

      vault.dec().then((decimals) => {
        setVaultInfo({ decimals: decimals.toNumber() })
      })
    }
  }, [address, readOnlyAppProvider, vaultAddress])

  return { address, userActions, userProxy, vaultInfo }
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
