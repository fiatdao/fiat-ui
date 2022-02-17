import { BigNumberToDateOrCurrent } from '../dateTime'
import contractCall from '../contractCall'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from 'bignumber.js'
import { Collaterals_collaterals as SubgraphCollateral } from '@/types/subgraph/__generated__/collaterals'

import { ChainsValues } from '@/src/constants/chains'
import { Maybe } from '@/types/utils'
import { contracts } from '@/src/constants/contracts'
import { ZERO_ADDRESS } from '@/src/constants/misc'
import { Collybus } from '@/types/typechain/Collybus'
import { ERC20 } from '@/types/typechain'

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
  hasBalance: boolean
}

const wrangleCollateral = async (
  collateral: SubgraphCollateral,
  provider: Web3Provider,
  appChainId: ChainsValues,
): Promise<Collateral> => {
  const {
    abi: collybusAbi,
    address: { [appChainId]: collybusAddress },
  } = contracts.COLLYBUS

  const erc20abi = contracts.ERC_20.abi

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

  const address = await provider.getSigner().getAddress()
  const balance = await contractCall<ERC20, 'balanceOf'>(
    collateral.address ?? ZERO_ADDRESS,
    erc20abi,
    provider,
    'balanceOf',
    [address],
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
    hasBalance: !!balance && balance.gt(0),
  }
}
export { wrangleCollateral }
