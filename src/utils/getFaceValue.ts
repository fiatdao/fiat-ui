import { Maybe } from '@/types/utils'
import { contracts } from '@/src/constants/contracts'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import contractCall from '@/src/utils/contractCall'
import { Vault20 } from '@/types/typechain'
import BigNumber from 'bignumber.js'
import { JsonRpcProvider } from '@ethersproject/providers'

export const getFaceValue = async (
  provider: JsonRpcProvider,
  tokenId: number | string,
  vaultAddress: Maybe<string>,
) => {
  let faceValue = ZERO_BIG_NUMBER

  if (vaultAddress) {
    // FIXME Check protocol if is not an ERC20?
    const _faceValue = await contractCall<Vault20, 'fairPrice'>(
      vaultAddress,
      contracts.VAULT_20.abi,
      provider,
      'fairPrice',
      [tokenId, false, true],
    )

    if (_faceValue) {
      faceValue = BigNumber.from(_faceValue.toString()) as BigNumber
    }
  }

  return faceValue
}
