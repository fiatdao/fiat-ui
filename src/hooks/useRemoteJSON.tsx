import useContractCall from './contracts/useContractCall'
import { ZERO_BN } from '../constants/misc'
import axios from 'axios'
import { BigNumber } from 'ethers'
import { useEffect, useState } from 'react'
import tranche from '@/src/abis/Tranche.json'

export const useTranchePosition = async (id: string) => {
  // symbol, name, collateral (para el iconito), maturity as Date, isEnded
  // faceValue, currentValue
  const symbol = useContractCall(id, tranche, 'symbol', null, {})

  return symbol
}

export const usePositionBalance = (id: string): BigNumber => {
  return ZERO_BN
}

// TODO Change name or receive address URL by parameter
// TODO Detect network to use
export const useRemoteJSON = () => {
  const [object, setObject] = useState<JSON | null>(null)

  const addresses =
    'https://raw.githubusercontent.com/element-fi/elf-deploy/main/addresses/goerli.json'
  useEffect(() => {
    axios.get(addresses).then(({ data }) => setObject(data))
  }, [])

  return object
}
