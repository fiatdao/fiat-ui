import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { contracts } from '@/src/constants/contracts'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { getHumanValue } from '@/src/web3/utils'
import BigNumber from 'bignumber.js'
import { KeyedMutator } from 'swr'

export const useFIATBalance = (asHumanValue = false): [BigNumber, KeyedMutator<any>] => {
  const { address: currentUserAddress, appChainId } = useWeb3Connection()

  const [FIATBalance, refetchFIATBalance] = useContractCall(
    contracts.FIAT.address[appChainId],
    contracts.FIAT.abi,
    'balanceOf',
    [currentUserAddress],
  ) ?? [ZERO_BIG_NUMBER, null]

  const humanValueBalance = FIATBalance
    ? getHumanValue(FIATBalance.toString(), contracts.FIAT.decimals)
    : ZERO_BIG_NUMBER

  return [(asHumanValue ? humanValueBalance : FIATBalance) as BigNumber, refetchFIATBalance]
}
