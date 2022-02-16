import { BigNumberToDateOrCurrent } from '../dateTime'
import contractCall from '../contractCall'
import { JsonRpcProvider } from '@ethersproject/providers'
import { BigNumber } from 'bignumber.js'
import { Collaterals_collaterals as SubgraphCollateral } from '@/types/subgraph/__generated__/collaterals'

import { ChainsValues } from '@/src/constants/chains'
import { Maybe } from '@/types/utils'
import { contracts } from '@/src/constants/contracts'
import { ZERO_ADDRESS } from '@/src/constants/misc'
import { Collybus } from '@/types/typechain/Collybus'

export type Collateral = {
  id: string
  tokenId: Maybe<string>
  vaultName: Maybe<string>
  symbol: Maybe<string>
  underlierSymbol: Maybe<string>
  underlierAddress: Maybe<string>
  maturity: Date
  address: Maybe<string>
  faceValue: Maybe<BigNumber>
  currentValue: Maybe<BigNumber>
  vault: { collateralizationRatio: Maybe<BigNumber>; address: string }
}

const wrangleCollateral = async (
  collateral: SubgraphCollateral,
  provider: JsonRpcProvider,
  appChainId: ChainsValues,
): Promise<Collateral> => {
  const {
    abi: collybusAbi,
    address: { [appChainId]: collybusAddress },
  } = contracts.COLLYBUS

  let currentValue = null
  if (
    collateral?.underlierAddress &&
    collateral.vault?.address &&
    collateral.maturity &&
    collateral?.underlierAddress !== ZERO_ADDRESS
  ) {
    currentValue = await contractCall<Collybus, 'read'>(
      collybusAddress,
      collybusAbi,
      provider,
      'read',
      [
        collateral.vault.address,
        collateral.underlierAddress,
        0, // FIXME Check protocol if is not an ERC20?
        collateral.maturity,
        false,
      ],
    )
  }
  console.log(
    collateral.vault?.collateralizationRatio?.toString(),
    BigNumber.from(collateral.vault?.collateralizationRatio)?.toString(),
  )

  return {
    ...collateral,
    maturity: BigNumberToDateOrCurrent(collateral.maturity),
    faceValue: BigNumber.from(collateral.faceValue) ?? null,
    currentValue: BigNumber.from(currentValue?.toString()) ?? null,
    vault: {
      collateralizationRatio: BigNumber.from(collateral.vault?.collateralizationRatio) ?? null,
      address: collateral.vault?.address ?? '',
    },
  }
}
export { wrangleCollateral }
