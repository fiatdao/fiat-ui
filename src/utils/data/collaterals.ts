import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from 'bignumber.js'
import contractCall from '@/src/utils/contractCall'
import { stringToDateOrCurrent } from '@/src/utils/dateTime'
import { Collaterals_collateralTypes as SubgraphCollateral } from '@/types/subgraph/__generated__/Collaterals'

import { ChainsValues } from '@/src/constants/chains'
import { Maybe } from '@/types/utils'
import { contracts } from '@/src/constants/contracts'
import { ONE_BIG_NUMBER, WAD_DECIMALS, ZERO_ADDRESS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { Collybus } from '@/types/typechain/Collybus'
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
    debtFloor: BigNumber
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

  return {
    ...collateral,
    maturity: stringToDateOrCurrent(collateral.maturity),
    faceValue: BigNumber.from(collateral.faceValue) ?? null,
    currentValue: BigNumber.from(currentValue?.toString()) ?? null,
    vault: {
      collateralizationRatio:
        BigNumber.from(collateral.vault?.collateralizationRatio) ?? ONE_BIG_NUMBER,
      address: collateral.vault?.address ?? '',
      interestPerSecond: BigNumber.from(collateral.vault?.interestPerSecond) ?? null,
      debtFloor: BigNumber.from(collateral.vault?.debtFloor) ?? ZERO_BIG_NUMBER,
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
