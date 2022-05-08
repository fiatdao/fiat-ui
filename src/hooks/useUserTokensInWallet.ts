import { contracts } from '../constants/contracts'
import { getHumanValue } from '../web3/utils'
import { ERC1155 } from '../../types/typechain'
import { Collateral } from '../utils/data/collaterals'
import useSWR from 'swr'
import { JsonRpcProvider } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { BigNumberish, Contract } from 'ethers'
import { ERC20 } from '@/types/typechain'

export const useUserTokensInWallet = ({
  address,
  collaterals,
  readOnlyAppProvider,
}: {
  collaterals?: Collateral[]
  address: string | null
  readOnlyAppProvider: JsonRpcProvider
}): string[] | undefined => {
  const { data: tokenList } = useSWR(
    [collaterals, readOnlyAppProvider, address],
    async (): Promise<string[]> => {
      if (!collaterals || !address) {
        return []
      }

      const tokenList: string[] = []

      collaterals?.forEach((collateral) => {
        const is1155 = collateral.vault?.vaultType === 'ERC1155'
        const collateralContract = new Contract(
          collateral.address as string,
          is1155 ? contracts.ERC_1155.abi : contracts.ERC_20.abi,
          readOnlyAppProvider,
        ) as ERC1155 | ERC20

        Promise.all(
          is1155
            ? [8, collateralContract.balanceOf(address, collateral.tokenId as BigNumberish)]
            : // @ts-ignore
              [collateralContract.decimals(), collateralContract.balanceOf(address)],
        ).then(([decimals, balance]) => {
          const humanValue = getHumanValue(BigNumber.from(balance.toString()), decimals)
          !humanValue?.isZero() ? tokenList.push(collateral.address as string) : null
        })
      })
      return tokenList
    },
  )
  return tokenList
}
