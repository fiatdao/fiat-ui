import { VaultEPTActions } from '@/types/typechain'
import { contracts } from '@/src/constants/contracts'
import contractCall from '@/src/utils/contractCall'
import { ChainsValues } from '@/src/constants/chains'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { BytesLike } from '@ethersproject/bytes'
import { JsonRpcProvider } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'

type PTokenToUnderlier = {
  vault: string
  balancerVault: string
  curvePoolId: BytesLike
  pTokenAmount: BigNumber
}

export const pTokenToUnderlier = async (
  appChainId: ChainsValues,
  provider: JsonRpcProvider,
  params: PTokenToUnderlier,
): Promise<BigNumber> => {
  const pTokenToUnderlier = await contractCall<VaultEPTActions, 'pTokenToUnderlier'>(
    contracts.USER_ACTIONS_EPT.address[appChainId],
    contracts.USER_ACTIONS_EPT.abi,
    provider,
    'pTokenToUnderlier',
    [params.vault, params.balancerVault, params.curvePoolId, params.pTokenAmount.toFixed(0, 8)],
  )

  // BigNumber.from(n.toString()) is to convert ethers to bignumber.js bignumber
  return BigNumber.from(pTokenToUnderlier?.toString()) ?? ZERO_BIG_NUMBER
}
