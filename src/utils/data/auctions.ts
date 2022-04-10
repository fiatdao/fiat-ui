import { Maybe } from '@/types/utils'
import { BigNumberToDateOrCurrent } from '@/src/utils/dateTime'
import { getCollateralMetadata } from '@/src/constants/bondTokens'
import { auctionById_collateralAuction as subGraphAuction } from '@/types/subgraph/__generated__/auctionById'
import { auctions_collateralAuctions as subGraphAuctions } from '@/types/subgraph/__generated__/auctions'
import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import {
  SECONDS_IN_A_YEAR,
  WAD_DECIMALS,
  ZERO_ADDRESS,
  ZERO_BIG_NUMBER,
} from '@/src/constants/misc'
import contractCall from '@/src/utils/contractCall'
import { NoLossCollateralAuction } from '@/types/typechain'
import { TokenData } from '@/types/token'
import max from 'lodash/max'
import BigNumber from 'bignumber.js'
import { JsonRpcProvider } from '@ethersproject/providers'

export const scaleToDecimalsCount = (scale?: Maybe<string>): number | undefined => {
  if (!scale) {
    return
  }

  const exponentialRegex = /1e[-+](\d)$/
  const decimalPlaces = BigNumber.from(scale)?.toExponential().match(exponentialRegex)?.[1]

  if (typeof decimalPlaces === 'string') {
    return Number(decimalPlaces)
  }

  return decimalPlaces
}

export type AuctionData = {
  id: string
  protocol: {
    name?: Maybe<string>
    humanReadableName: string
  }
  asset?: string
  auctionedCollateral?: BigNumber
  currentAuctionPrice?: BigNumber
  faceValue?: BigNumber
  collateralMaturity: number
  tokenId?: Maybe<string>
  vault: { address?: Maybe<string>; name?: Maybe<string>; interestPerSecond?: BigNumber }
  action: { isActive: Maybe<boolean>; id: number | string }
  tokenAddress?: string | null
  collateral: TokenData
  underlier: TokenData
  endsAt: Date
  apy: string
}

const getTimeToMaturity = (maturity: number, blockTimestamp: number) => {
  return max([0, maturity - blockTimestamp]) ?? 0
}

// APY === Yield
const calcAPY = (
  faceValue?: BigNumber,
  currentAuctionPrice?: BigNumber,
  maturity = 0,
  blockTimestamp = 0,
) => {
  if (!faceValue || !currentAuctionPrice) {
    return 'Unavailable'
  }

  // APY: ( faceValue / currentAuctionPrice - 1) / ( max(0, maturity - block.timestamp) / (365*86400) )
  return faceValue
    .dividedBy(currentAuctionPrice)
    .minus(1)
    .dividedBy(
      BigNumber.from(getTimeToMaturity(maturity, blockTimestamp)).dividedBy(SECONDS_IN_A_YEAR),
    )
    .multipliedBy(100)
    .toFixed(2)
}

const getAuctionStatus = (
  appChainId: ChainsValues,
  provider: JsonRpcProvider,
  auctionId: string,
) => {
  return contractCall<NoLossCollateralAuction, 'getStatus'>(
    contracts.NO_LOSS_COLLATERAL_AUCTION.address[appChainId],
    contracts.NO_LOSS_COLLATERAL_AUCTION.abi,
    provider,
    'getStatus',
    [auctionId],
  )
}

const getAuctionVaultConfig = (
  appChainId: ChainsValues,
  provider: JsonRpcProvider,
  vaultAddress: string,
) => {
  return contractCall<NoLossCollateralAuction, 'vaults'>(
    contracts.NO_LOSS_COLLATERAL_AUCTION.address[appChainId],
    contracts.NO_LOSS_COLLATERAL_AUCTION.abi,
    provider,
    'vaults',
    [vaultAddress],
  )
}

const wrangleAuction = async (
  collateralAuction: subGraphAuctions | subGraphAuction,
  provider: JsonRpcProvider,
  appChainId: ChainsValues,
  blockTimestamp: number,
): Promise<AuctionData> => {
  const vaultConfig = await getAuctionVaultConfig(
    appChainId,
    provider,
    collateralAuction.vault?.address ?? ZERO_ADDRESS,
  )

  let endsAt = ZERO_BIG_NUMBER
  if (collateralAuction.startsAt) {
    endsAt = endsAt.plus(collateralAuction.startsAt)
  }
  if (vaultConfig?.maxAuctionDuration) {
    endsAt = endsAt.plus(vaultConfig.maxAuctionDuration.toNumber())
  }

  const auctionStatus = await getAuctionStatus(appChainId, provider, collateralAuction.id)

  const faceValue = BigNumber.from(collateralAuction.collateralType?.faceValue)?.unscaleBy(
    WAD_DECIMALS,
  )

  const currentAuctionPrice = BigNumber.from(auctionStatus?.price.toString())?.unscaleBy(
    WAD_DECIMALS,
  )

  const vaultMetadata = getCollateralMetadata(appChainId, {
    vaultAddress: collateralAuction.vault?.address,
    tokenId: collateralAuction.tokenId,
  })

  return {
    id: collateralAuction.id,
    protocol: {
      name: collateralAuction.vault?.name,
      humanReadableName: vaultMetadata?.protocol ?? '',
    },
    tokenId: collateralAuction.tokenId,
    vault: {
      address: collateralAuction.vault?.address,
      name: collateralAuction.vault?.name,
      interestPerSecond: BigNumber.from(collateralAuction.vault?.interestPerSecond?.toString()),
    },
    asset: vaultMetadata?.symbol,
    auctionedCollateral: BigNumber.from(auctionStatus?.collateralToSell.toString())?.unscaleBy(
      WAD_DECIMALS,
    ),
    currentAuctionPrice,
    faceValue,
    collateralMaturity: Number(collateralAuction.collateralType?.maturity),
    action: { isActive: collateralAuction.isActive, id: collateralAuction.id },
    collateral: {
      address: collateralAuction.collateralType?.address ?? '',
      symbol: collateralAuction.collateralType?.symbol ?? '',
      decimals: vaultMetadata?.decimals ?? 0,
    },
    underlier: {
      address: collateralAuction.collateralType?.underlierAddress ?? '',
      symbol: collateralAuction.collateralType?.underlierSymbol ?? '',
      decimals: scaleToDecimalsCount(collateralAuction.collateralType?.underlierScale) ?? 0,
    },
    endsAt: BigNumberToDateOrCurrent(endsAt.toString()),
    apy: calcAPY(
      faceValue,
      currentAuctionPrice,
      Number(collateralAuction.collateralType?.maturity ?? 0),
      blockTimestamp,
    ),
  }
}

export { wrangleAuction }
