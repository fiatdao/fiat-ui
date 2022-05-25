import { TokenInfo } from './managePosition'
import { contracts } from '../constants/contracts'
import { getHumanValue } from '../web3/utils'
import { ERC1155 } from '../../types/typechain'
import { TokenData } from '../../types/token'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { ERC20 } from '@/types/typechain'
import useSWR, { KeyedMutator } from 'swr'
import { JsonRpcProvider } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { BigNumberish, Contract } from 'ethers'

type UseDecimalsAndTokenValue = {
  tokenInfo?: TokenInfo
  updateToken: KeyedMutator<TokenInfo>
}

export const useTokenDecimalsAndBalance = ({
  address,
  readOnlyAppProvider,
  tokenData,
  tokenId,
  vaultType,
}: {
  tokenId: string
  vaultType: string
  tokenData: TokenData
  address: string | null
  readOnlyAppProvider: JsonRpcProvider
}): UseDecimalsAndTokenValue => {
  const { data: tokenInfo, mutate: updateToken } = useSWR(
    [tokenData, readOnlyAppProvider, address],
    async (): Promise<TokenInfo> => {
      if (!tokenData || !address) {
        return {
          decimals: 0,
          humanValue: ZERO_BIG_NUMBER,
        }
      }

      const is1155 = vaultType === 'NOTIONAL'
      const collateralContract = new Contract(
        tokenData.address as string,
        is1155 ? contracts.ERC_1155.abi : contracts.ERC_20.abi,
        readOnlyAppProvider,
      ) as ERC1155 | ERC20

      return Promise.all(
        is1155
          ? [8, (collateralContract as ERC1155).balanceOf(address, tokenId as BigNumberish)]
          : [
              (collateralContract as ERC20)?.decimals(),
              (collateralContract as ERC20).balanceOf(address),
            ],
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
