import { JsonRpcProvider } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { Maybe } from '@/types/utils'
import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import contractCall from '@/src/utils/contractCall'
import { Vault20 } from '@/types/typechain'

export const getCurrentValue = async (
  provider: JsonRpcProvider,
  appChainId: ChainsValues,
  tokenId: number | string,
  vaultAddress: Maybe<string>,
  isFaceValue = false,
) => {
  let collateralValue = ZERO_BIG_NUMBER

  if (vaultAddress) {
    const _collateralValue = await contractCall<Vault20, 'fairPrice'>(
      vaultAddress,
      contracts.VAULT_20.abi,
      provider,
      'fairPrice',
      [tokenId as number, isFaceValue, isFaceValue],
    )

    if (_collateralValue) {
      collateralValue = BigNumber.from(_collateralValue.toString()) as BigNumber
    }
  }

  return collateralValue
}
