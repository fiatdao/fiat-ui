import { getFaceValue } from '../getFaceValue'
import { getVirtualRate } from '../getVirtualRate'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { hexToAscii } from 'web3-utils'
import { BigNumber } from 'bignumber.js'
import contractCall from '@/src/utils/contractCall'
import { stringToDateOrCurrent } from '@/src/utils/dateTime'
import {
  Collaterals_collateralTypes as SubgraphCollateral,
  Collaterals_collybusSpots as SubgraphSpot,
} from '@/types/subgraph/__generated__/Collaterals'

import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { ONE_BIG_NUMBER, WAD_DECIMALS, ZERO_ADDRESS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { Collybus } from '@/types/typechain/Collybus'
import { getHumanValue } from '@/src/web3/utils'
import { getCollateralMetadata } from '@/src/constants/bondTokens'
import { Maybe } from '@/types/utils'

export type Collateral = {
  id: string
  tokenId: Maybe<string>
  symbol: string
  asset: string
  protocol: string
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
    type: string
    vaultType: string
    collateralizationRatio: Maybe<BigNumber>
    address: string
    interestPerSecond: Maybe<BigNumber>
    debtFloor: BigNumber
    name: string
    virtualRate: BigNumber
  }
  manageId?: string
  url?: string
}

const wrangleCollateral = async (
  collateral: SubgraphCollateral,
  provider: Web3Provider | JsonRpcProvider,
  appChainId: ChainsValues,
  spotPrice: Maybe<SubgraphSpot>,
  discountRate: Maybe<BigNumber>,
): Promise<Collateral> => {
  const {
    abi: collybusAbi,
    address: { [appChainId]: collybusAddress },
  } = contracts.COLLYBUS

  const virtualRate = await getVirtualRate(
    appChainId,
    provider,
    collateral.vault?.address ?? undefined,
  )

  let currentValue = null
  if (spotPrice && collateral.faceValue && collateral.maturity && discountRate) {
    const numerator = (BigNumber.from(collateral.faceValue) as BigNumber).multipliedBy(
      (BigNumber.from(spotPrice.spot) as BigNumber).unscaleBy(WAD_DECIMALS),
    )
    const currentBlockTimestamp = (await provider.getBlock(await provider.getBlockNumber()))
      .timestamp
    const denominator = discountRate
      .unscaleBy(WAD_DECIMALS)
      .plus(1)
      .pow(Math.max(Number(collateral.maturity) - currentBlockTimestamp, 0))

    // Numerator units 10**18, Denominator units 10**0, currentValue units 10**18
    currentValue = numerator.div(denominator)
  } else if (
    // Revert to contract call if relevant data not found on subgraph
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
        collateral.tokenId ?? 0,
        collateral.maturity,
        false,
      ],
    )
  }

  const faceValue = await getFaceValue(
    provider,
    collateral.tokenId ?? 0,
    collateral.vault?.address ?? '',
  )

  const {
    asset = '',
    protocol = '',
    symbol = '',
    urls,
  } = getCollateralMetadata(appChainId, {
    vaultAddress: collateral.vault?.address,
    tokenId: collateral.tokenId,
  }) ?? {}

  return {
    ...collateral,
    protocol,
    symbol,
    asset,
    maturity: stringToDateOrCurrent(collateral.maturity),
    faceValue,
    currentValue: BigNumber.from(currentValue?.toString()) ?? null,
    vault: {
      collateralizationRatio:
        BigNumber.from(collateral.vault?.collateralizationRatio) ?? ONE_BIG_NUMBER,
      address: collateral.vault?.address ?? '',
      interestPerSecond: BigNumber.from(collateral.vault?.interestPerSecond) ?? null,
      debtFloor: BigNumber.from(collateral.vault?.debtFloor) ?? ZERO_BIG_NUMBER,
      name: collateral.vault?.name ?? '',
      type: collateral.vault?.type ?? '',
      vaultType: collateral.vault?.vaultType
        ? // TODO: Improve this logic
          hexToAscii(collateral.vault?.vaultType).split(':')[0]
        : '',
      virtualRate: virtualRate as BigNumber,
    },
    eptData: {
      balancerVault: collateral.eptData?.balancerVault ?? '',
      convergentCurvePool: collateral.eptData?.convergentCurvePool ?? '',
      id: collateral.eptData?.id ?? '',
      poolId: collateral.eptData?.poolId ?? '',
    },
    url: urls?.asset,
  }
}

const formatColRatio = (ratio: BigNumber) => {
  // We want it as 0-100+ value, not a 0-1+
  return `${getHumanValue(ratio ?? 0, WAD_DECIMALS - 2)}`
}

export { wrangleCollateral, formatColRatio }
