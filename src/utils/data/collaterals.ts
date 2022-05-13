import { getFaceValue } from '../getFaceValue'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from 'bignumber.js'
import { hexToAscii } from 'web3-utils'
import { getCollateralMetadata } from '@/src/constants/bondTokens'
import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { ONE_BIG_NUMBER, WAD_DECIMALS, ZERO_ADDRESS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import contractCall from '@/src/utils/contractCall'
import { stringToDateOrCurrent } from '@/src/utils/dateTime'
import { getHumanValue } from '@/src/web3/utils'
import { Collaterals_collateralTypes as SubgraphCollateral } from '@/types/subgraph/__generated__/Collaterals'
import { Publican } from '@/types/typechain'
import { Collybus } from '@/types/typechain/Collybus'
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
}

const wrangleCollateral = async (
  collateral: SubgraphCollateral,
  provider: Web3Provider | JsonRpcProvider,
  appChainId: ChainsValues,
): Promise<Collateral> => {
  const {
    abi: collybusAbi,
    address: { [appChainId]: collybusAddress },
  } = contracts.COLLYBUS

  if (
    !collateral.underlierAddress ||
    !collateral.vault?.address ||
    !collateral.maturity ||
    collateral.underlierAddress === ZERO_ADDRESS
  ) {
    throw new Error(
      `Cannot wrangle collateral with invalid properties: ${{
        underlierAddress: collateral.underlierAddress,
        vault: collateral.vault,
        maturity: collateral.maturity,
      }}`,
    )
  }

  const virtualRate = (await contractCall<Publican, 'virtualRate'>(
    contracts.PUBLICAN.address[appChainId],
    contracts.PUBLICAN.abi,
    provider,
    'virtualRate',
    [collateral.vault.address],
  )) as BigNumber | null
  console.log('virtualrate : ', virtualRate?.toString())

  if (virtualRate === null) {
    throw new Error(`Error, unable to fetch virtual rate for vault: ${collateral.vault}`)
  }

  const currentValue = await contractCall<Collybus, 'read'>(
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

  const faceValue = await getFaceValue(
    provider,
    collateral.tokenId ?? 0,
    collateral.vault?.address ?? '',
  )

  const {
    asset = '',
    protocol = '',
    symbol = '',
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
      virtualRate,
    },
    eptData: {
      balancerVault: collateral.eptData?.balancerVault ?? '',
      convergentCurvePool: collateral.eptData?.convergentCurvePool ?? '',
      id: collateral.eptData?.id ?? '',
      poolId: collateral.eptData?.poolId ?? '',
    },
  }
}

const formatColRatio = (ratio: BigNumber) => {
  // We want it as 0-100+ value, not a 0-1+
  return `${getHumanValue(ratio ?? 0, WAD_DECIMALS - 2)}`
}

export { wrangleCollateral, formatColRatio }
