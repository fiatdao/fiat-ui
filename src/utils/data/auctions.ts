import { getFaceValue } from '../getFaceValue'
import { Maybe } from '@/types/utils'
import { stringToDateOrCurrent } from '@/src/utils/dateTime'
import { getCollateralMetadata } from '@/src/constants/bondTokens'
import { auctionById_collateralAuction as subGraphAuction } from '@/types/subgraph/__generated__/auctionById'
import { auctions_collateralAuctions as subGraphAuctions } from '@/types/subgraph/__generated__/auctions'
import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { SECONDS_IN_A_YEAR, WAD_DECIMALS } from '@/src/constants/misc'
import contractCall from '@/src/utils/contractCall'
import { NoLossCollateralAuction } from '@/types/typechain'
import { TokenData } from '@/types/token'
import { JsonRpcProvider } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import max from 'lodash/max'

export const scaleToDecimalsCount = (scale?: Maybe<string>): number | undefined => {
  if (!scale) {
    return
  }

  // Safe to make assumption that scale will be >= 1
  const decimalPlaces = BigNumber.from(scale)?.toExponential().split('+')[1]

  if (typeof decimalPlaces === 'string') {
    return Number(decimalPlaces)
  }

  return decimalPlaces
}

export type AuctionData = {
  id: string
  debt?: BigNumber
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
  vault: {
    type?: string
    address?: Maybe<string>
    name?: Maybe<string>
    interestPerSecond?: BigNumber
    auctionDebtFloor?: BigNumber
  }
  action: { isActive: Maybe<boolean>; id: number | string }
  tokenAddress?: string | null
  collateral: TokenData
  underlier: TokenData
  endsAt: Date
  apy: string
  url?: string
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

const wrangleAuction = async (
  collateralAuction: subGraphAuctions | subGraphAuction,
  provider: JsonRpcProvider,
  appChainId: ChainsValues,
  blockTimestamp: number,
): Promise<AuctionData> => {
  let endsAt = null
  if (
    collateralAuction.collateralToSell &&
    collateralAuction.startPrice &&
    collateralAuction.vault
  ) {
    // floorPrice = auction.debt / auction.collateralToSell
    const floorPrice = BigNumber.from(collateralAuction.debt)?.dividedBy(
      collateralAuction.collateralToSell,
    ) as BigNumber

    // endsAt = vault.maxAuctionDuration * (auction.startPrice - auction.floorPrice)/auction.startPrice
    endsAt = BigNumber.from(collateralAuction.collateralType?.maturity)
      ?.plus(collateralAuction.vault.maxAuctionDuration as string)
      ?.times(
        (BigNumber.from(collateralAuction.startPrice) as BigNumber)
          .minus(floorPrice)
          .dividedBy(collateralAuction.startPrice),
      )
      .decimalPlaces(0)
      .toString()
  }

  const auctionStatus = await getAuctionStatus(appChainId, provider, collateralAuction.id)
  const faceValue = (
    await getFaceValue(
      provider,
      collateralAuction.tokenId ?? 0,
      collateralAuction.vault?.address ?? '',
    )
  ).unscaleBy(WAD_DECIMALS)

  const currentAuctionPrice = BigNumber.from(auctionStatus?.price.toString())?.unscaleBy(
    WAD_DECIMALS,
  )

  const vaultMetadata = getCollateralMetadata(appChainId, {
    vaultAddress: collateralAuction.vault?.address,
    tokenId: collateralAuction.tokenId,
  })

  return {
    id: collateralAuction.id,
    debt: BigNumber.from(collateralAuction.debt),
    protocol: {
      name: collateralAuction.vault?.name,
      humanReadableName: vaultMetadata?.protocol ?? '',
    },
    tokenId: collateralAuction.tokenId,
    vault: {
      type: collateralAuction.vault?.type ?? '',
      address: collateralAuction.vault?.address,
      name: collateralAuction.vault?.name,
      interestPerSecond: BigNumber.from(collateralAuction.vault?.interestPerSecond),
      auctionDebtFloor: BigNumber.from(collateralAuction.vault?.auctionDebtFloor),
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
    endsAt: stringToDateOrCurrent(endsAt),
    apy: calcAPY(
      faceValue,
      currentAuctionPrice,
      Number(collateralAuction.collateralType?.maturity ?? 0),
      blockTimestamp,
    ),
    url: vaultMetadata?.urls?.asset,
  }
}

export { wrangleAuction }
