import { getHumanValue } from '../web3/utils'
import { JsonRpcProvider } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { VIRTUAL_RATE, WAD_DECIMALS } from '@/src/constants/misc'
import contractCall from '@/src/utils/contractCall'
import { Publican } from '@/types/typechain'

export const getVirtualRate = async (
  vaultAddress: string,
  appChainId: ChainsValues,
  provider: JsonRpcProvider,
): Promise<BigNumber> => {
  try {
    const virtualRate = await contractCall<Publican, 'virtualRate'>(
      contracts.PUBLICAN.address[appChainId],
      contracts.PUBLICAN.abi,
      provider,
      'virtualRate',
      [vaultAddress],
    )
    if (virtualRate) {
      return getHumanValue(virtualRate.toString(), WAD_DECIMALS)
    }
    return VIRTUAL_RATE
  } catch (err) {
    return VIRTUAL_RATE
  }
}
