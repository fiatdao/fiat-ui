import { TokenInfo } from './managePosition'
import { contracts } from '../constants/contracts'
import { getHumanValue } from '../web3/utils'
import useSWR, { KeyedMutator } from 'swr'
import { JsonRpcProvider } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { Contract } from 'ethers'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { ERC20 } from '@/types/typechain'

type UseDecimalsAndTokenValue = {
  tokenInfo?: TokenInfo
  updateToken: KeyedMutator<TokenInfo>
}

export const useTokenDecimalsAndBalance = ({
  address,
  readOnlyAppProvider,
  tokenAddress,
}: {
  tokenAddress?: string
  address: string | null
  readOnlyAppProvider: JsonRpcProvider
}): UseDecimalsAndTokenValue => {
  const { data: tokenInfo, mutate: updateToken } = useSWR(
    [tokenAddress, readOnlyAppProvider, address],
    async (): Promise<TokenInfo> => {
      if (!tokenAddress || !address) {
        return {
          decimals: 0,
          humanValue: ZERO_BIG_NUMBER,
        }
      }
      const collateral = new Contract(
        tokenAddress,
        contracts.ERC_20.abi,
        readOnlyAppProvider,
      ) as ERC20

      return Promise.all([collateral.decimals(), collateral.balanceOf(address)]).then(
        ([decimals, balance]) => {
          return {
            decimals,
            humanValue: getHumanValue(BigNumber.from(balance.toString()), decimals),
          }
        },
      )
    },
  )

  return { tokenInfo, updateToken }
}
