import { BigNumberToDateOrCurrent } from '../dateTime'
import contractCall from '../contractCall'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from 'bignumber.js'
import { Collaterals_collateralTypes as SubgraphCollateral } from '@/types/subgraph/__generated__/Collaterals'

import { ChainsValues } from '@/src/constants/chains'
import { Maybe } from '@/types/utils'
import { contracts } from '@/src/constants/contracts'
import { ONE_BIG_NUMBER, WAD_DECIMALS, ZERO_ADDRESS } from '@/src/constants/misc'
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
  eptData: {
    balancerVault: string
    convergentCurvePool: string
    id: string
    poolId: string
  }
  address: Maybe<string>
  faceValue: Maybe<BigNumber>
  currentValue: Maybe<BigNumber>
  vault: {
    collateralizationRatio: Maybe<BigNumber>
    address: string
    interestPerSecond: Maybe<BigNumber>
  }
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
    collateral.underlierAddress &&
    collateral.vault?.address &&
    collateral.maturity &&
    collateral.underlierAddress !== ZERO_ADDRESS
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

  let userAddress = null
  try {
    userAddress = await provider.getSigner().getAddress()
  } catch (e) {
    console.warn('Error getting address, likely due to disconnected wallet | ', e)
  }

  const balance = await contractCall<ERC20, 'balanceOf'>(
    collateral.address ?? ZERO_ADDRESS,
    contracts.ERC_20.abi,
    provider,
    'balanceOf',
    userAddress ? [userAddress] : null,
  )

  const userProxyAddress = await contractCall<PRBProxy, 'getCurrentProxy'>(
    contracts.PRB_Proxy.address[appChainId],
    contracts.PRB_Proxy.abi,
    provider,
    'getCurrentProxy',
    userAddress ? [userAddress] : null,
  )

  const position = await contractCall<Codex, 'positions'>(
    contracts.CODEX.address[appChainId],
    contracts.CODEX.abi,
    provider,
    'positions',
    [collateral.vault?.address ?? ZERO_ADDRESS, '0x0', userProxyAddress ?? ZERO_ADDRESS],
  )

  const hasPosition = !position?.collateral.isZero() || !position?.normalDebt.isZero()

  return {
    ...collateral,
    maturity: BigNumberToDateOrCurrent(collateral.maturity),
    faceValue: BigNumber.from(collateral.faceValue) ?? null,
    currentValue: BigNumber.from(currentValue?.toString()) ?? null,
    vault: {
      collateralizationRatio:
        BigNumber.from(collateral.vault?.collateralizationRatio) ?? ONE_BIG_NUMBER,
      address: collateral.vault?.address ?? '',
      interestPerSecond: BigNumber.from(collateral.vault?.interestPerSecond) ?? null,
    },
    eptData: {
      balancerVault: collateral.eptData?.balancerVault ?? '',
      convergentCurvePool: collateral.eptData?.convergentCurvePool ?? '',
      id: collateral.eptData?.id ?? '',
      poolId: collateral.eptData?.poolId ?? '',
    },
    hasBalance: !!balance && balance.gt(0),
    manageId:
      hasPosition && collateral.vault?.address && userProxyAddress !== ZERO_ADDRESS
        ? `${collateral.vault.address}-0x0-${userProxyAddress}`
        : null,
  }
}

const formatColRatio = (ratio: BigNumber) => {
  // We want it as 0-100+ value, not a 0-1+
  return `${getHumanValue(ratio ?? 0, WAD_DECIMALS - 2)}`
}
export { wrangleCollateral, formatColRatio }
