import { contracts } from '../constants/contracts'
import { getHumanValue } from '../web3/utils'
import useSWR from 'swr'
import { JsonRpcProvider } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { Contract } from 'ethers'
import { ERC20 } from '@/types/typechain'

export const useUserTokensInWallet = ({
  address,
  readOnlyAppProvider,
  tokenAddresses,
}: {
  tokenAddresses?: any[]
  address: string | null
  readOnlyAppProvider: JsonRpcProvider
}): string[] | undefined => {
  const { data: tokenList } = useSWR(
    [tokenAddresses, readOnlyAppProvider, address],
    async (): Promise<string[]> => {
      if (!tokenAddresses || !address) {
        return []
      }

      const tokenList: string[] = []
      tokenAddresses?.forEach((tokenAddress) => {
        const collateral = new Contract(
          tokenAddress,
          contracts.ERC_20.abi,
          readOnlyAppProvider,
        ) as ERC20

        Promise.all([collateral.decimals(), collateral.balanceOf(address)]).then(
          ([decimals, balance]) => {
            const humanValue = getHumanValue(BigNumber.from(balance.toString()), decimals)
            !humanValue?.isZero() ? tokenList.push(tokenAddress) : null
          },
        )
      })
      return tokenList
    },
  )
  return tokenList
}
