import { TokenInfo } from './managePosition'
import { contracts } from '../constants/contracts'
import { getHumanValue } from '../web3/utils'
import { Collateral } from '../utils/data/collaterals'
import { ERC1155 } from '../../types/typechain'
import useSWR, { KeyedMutator } from 'swr'
import { JsonRpcProvider } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { BigNumberish, Contract } from 'ethers'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { ERC20 } from '@/types/typechain'

type UseDecimalsAndTokenValue = {
  tokenInfo?: TokenInfo
  updateToken: KeyedMutator<TokenInfo>
}

export const useTokenDecimalsAndBalance = ({
  address,
  collateral,
  readOnlyAppProvider,
}: {
  collateral: Collateral
  address: string | null
  readOnlyAppProvider: JsonRpcProvider
}): UseDecimalsAndTokenValue => {
  const { data: tokenInfo, mutate: updateToken } = useSWR(
    [collateral, readOnlyAppProvider, address],
    async (): Promise<TokenInfo> => {
      if (!collateral || !address) {
        return {
          decimals: 0,
          humanValue: ZERO_BIG_NUMBER,
        }
      }

      const is1155 = collateral.vault?.vaultType === 'ERC1155'
      const collateralContract = new Contract(
        collateral.address as string,
        is1155 ? contracts.ERC_1155.abi : contracts.ERC_20.abi,
        readOnlyAppProvider,
      ) as ERC1155 | ERC20

      return Promise.all(
        is1155
          ? [18, collateralContract.balanceOf(address, collateral.tokenId as BigNumberish)]
          : // @ts-ignore
            [collateralContract?.decimals(), collateralContract.balanceOf(address)],
      ).then(([decimals, balance]) => {
        return {
          decimals,
          humanValue: getHumanValue(BigNumber.from(balance.toString()), decimals),
        }
      })
    },
  )

  return { tokenInfo, updateToken }
}
