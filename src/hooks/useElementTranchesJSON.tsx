import useContractCall from './contracts/useContractCall'
import { ZERO_BN } from '../constants/misc'
import { useWeb3Connection } from '../providers/web3ConnectionProvider'
import { ChainsValues, getNetworkConfig } from '../constants/chains'
import axios from 'axios'
import { BigNumber } from 'ethers'
import { useEffect, useState } from 'react'
import tranche from '@/src/abis/Tranche.json'
import { ElementJSON } from '@/types'

export const useTranchePosition = async (id: string) => {
  // symbol, name, collateral (para el iconito), maturity as Date, isEnded
  // faceValue, currentValue
  const symbol = useContractCall(id, tranche, 'symbol', null, {})

  return symbol
}

export const usePositionBalance = (id: string): BigNumber => {
  return ZERO_BN
}

export const useElementTranchesJSON = () => {
  const [object, setObject] = useState<ElementJSON | null>(null)
  const { appChainId, walletChainId, ...rest } = useWeb3Connection()
  const { shortName: networkName } = getNetworkConfig((walletChainId as ChainsValues) || appChainId)

  const jsonURL = `https://raw.githubusercontent.com/element-fi/elf-deploy/main/addresses/${networkName.toLowerCase()}.json`

  console.log({ walletChainId, jsonURL })
  useEffect(() => {
    axios
      .get(jsonURL)
      .then(({ data }: { data: ElementJSON }) => setObject(data))
      .catch(() => {
        throw new Error(`JSON ${jsonURL} not available in ${walletChainId}`)
      })
  }, [walletChainId, jsonURL])

  return object
}
