import { getHumanValue } from '../web3/utils'
import BigNumber from 'bignumber.js'
import { JsonRpcProvider } from '@ethersproject/providers'
import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { WAD_DECIMALS } from '@/src/constants/misc'
import contractCall from '@/src/utils/contractCall'
import { Publican } from '@/types/typechain'

export const getVirtualRate = async (
  appChainId: ChainsValues,
  provider: JsonRpcProvider,
  vaultAddress?: string,
): Promise<BigNumber> => {
  if (!vaultAddress) {
    throw new Error(`Can't fetch virtual rate without vaultAddress: ${{ vaultAddress }}`)
  }

  const virtualRate = await contractCall<Publican, 'virtualRate'>(
    contracts.PUBLICAN.address[appChainId],
    contracts.PUBLICAN.abi,
    provider,
    'virtualRate',
    [vaultAddress],
  )
  if (virtualRate) {
    return getHumanValue(virtualRate.toString(), WAD_DECIMALS)
  } else {
    throw new Error(`Null virtualRate for vault address: ${vaultAddress}`)
  }
}
