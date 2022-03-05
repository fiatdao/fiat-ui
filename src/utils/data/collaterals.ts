import { BigNumberToDateOrCurrent } from '../dateTime'
import contractCall from '../contractCall'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from 'bignumber.js'
import { Collaterals_collaterals as SubgraphCollateral } from '@/types/subgraph/__generated__/Collaterals'

import { ChainsValues } from '@/src/constants/chains'
import { Maybe } from '@/types/utils'
import { contracts } from '@/src/constants/contracts'
import { WAD_DECIMALS, ZERO_ADDRESS } from '@/src/constants/misc'
import { Collybus } from '@/types/typechain/Collybus'
import { Codex, ERC20, PRBProxy } from '@/types/typechain'
import { getHumanValue } from '@/src/web3/utils'

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
  vault: { collateralizationRatio: Maybe<BigNumber>; address: string; interestPerSecond: string }
  collateralizationRatio: number
  hasBalance: boolean
  manageId: Maybe<string>
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
    contracts.ERC_20.abi,
    provider,
    'balanceOf',
    [address],
  )
  const userProxyAddress = await contractCall<PRBProxy, 'getCurrentProxy'>(
    contracts.PRB_Proxy.address[appChainId],
    contracts.PRB_Proxy.abi,
    provider,
    'getCurrentProxy',
    [address],
  )

  const position = await contractCall<Codex, 'positions'>(
    contracts.CODEX.address[appChainId],
    contracts.CODEX.abi,
    provider,
    'positions',
    [collateral.vault?.address ?? ZERO_ADDRESS, '0x0', userProxyAddress ?? ZERO_ADDRESS],
  )

  const hasPosition = !position?.collateral.isZero() || !position?.normalDebt.isZero()

  const collateralizationRatio = getHumanValue(
    collateral?.vault?.collateralizationRatio ?? 0,
    WAD_DECIMALS,
  )

  return {
    ...collateral,
    maturity: BigNumberToDateOrCurrent(collateral.maturity),
    faceValue: BigNumber.from(collateral.faceValue) ?? null,
    currentValue: BigNumber.from(currentValue?.toString()) ?? null,
    collateralizationRatio: collateralizationRatio ? collateralizationRatio.toNumber() : 1,
    vault: {
      collateralizationRatio: BigNumber.from(collateral.vault?.collateralizationRatio) ?? null,
      address: collateral.vault?.address ?? '',
      interestPerSecond: collateral.vault?.interestPerSecond ?? '',
    },
    hasBalance: !!balance && balance.gt(0),
    manageId:
      hasPosition && collateral.vault?.address && userProxyAddress !== ZERO_ADDRESS
        ? `${collateral.vault.address}-0x0-${userProxyAddress}`
        : null,
  }
}
export { wrangleCollateral }
