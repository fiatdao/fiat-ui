import { JsonRpcProvider } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { getCurrentValue } from '@/src/utils/getCurrentValue'
import { auctionById_collateralAuction as subGraphAuction } from '@/types/subgraph/__generated__/auctionById'
import { auctions_collateralAuctions as subGraphAuctions } from '@/types/subgraph/__generated__/auctions'
import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { WAD_DECIMALS, ZERO_BIG_NUMBER } from '@/src/constants/misc'
import contractCall from '@/src/utils/contractCall'
import { CollateralAuction } from '@/types/typechain'
import { TokenData } from '@/types/token'

export type AuctionData = {
  id: string
  protocol?: string
  asset?: string
  upForAuction?: BigNumber
  price?: BigNumber
  collateralValue?: BigNumber
  collateralFaceValue?: BigNumber
  collateralMaturity: number
  tokenId?: string
  yield?: BigNumber
  vault?: { address: string; name?: string; interestPerSecond?: BigNumber }
  action: { isActive: boolean; id: number | string }
  tokenAddress?: string | null
  collateral: TokenData
  underlier: TokenData
}

const calcYield = (collateralValue?: BigNumber, auctionPrice?: BigNumber) => {
  if (!collateralValue || !auctionPrice) {
    return ZERO_BIG_NUMBER
  }

  return collateralValue.minus(auctionPrice).dividedBy(auctionPrice)
}

const getAuctionStatus = (
  appChainId: ChainsValues,
  provider: JsonRpcProvider,
  auctionId: string,
) => {
  return contractCall<CollateralAuction, 'getStatus'>(
    // TODO: it should be NON_LOSS_COLLATERAL_AUCTION
    contracts.COLLATERAL_AUCTION.address[appChainId],
    contracts.COLLATERAL_AUCTION.abi,
    provider,
    'getStatus',
    [auctionId],
  )
}

const wrangleAuction = async (
  collateralAuction: subGraphAuctions | subGraphAuction,
  provider: JsonRpcProvider,
  appChainId: ChainsValues,
) => {
  const vaultAddress = collateralAuction.vault?.address || null
  const tokenId = collateralAuction.collateralType?.tokenId || 0

  const collateralValue = await getCurrentValue(provider, appChainId, tokenId, vaultAddress, false)

  const auctionStatus = await getAuctionStatus(appChainId, provider, collateralAuction.id)

  // TODO is necessary extract decimals places?

  return {
    id: collateralAuction.id,
    protocol: collateralAuction.vault?.name,
    tokenId: collateralAuction.tokenId,
    vault: {
      address: collateralAuction.vault?.address,
      name: collateralAuction.vault?.name,
      interestPerSecond: BigNumber.from(collateralAuction.vault?.interestPerSecond?.toString()),
    },
    asset: collateralAuction.collateralType?.symbol,
    upForAuction: BigNumber.from(auctionStatus?.collateralToSell.toString())?.unscaleBy(
      WAD_DECIMALS,
    ),
    price: BigNumber.from(auctionStatus?.price.toString())?.unscaleBy(WAD_DECIMALS),
    collateralValue: collateralValue?.unscaleBy(WAD_DECIMALS),
    collateralFaceValue: BigNumber.from(collateralAuction.collateralType?.faceValue)?.unscaleBy(
      WAD_DECIMALS,
    ),
    collateralMaturity: Number(collateralAuction.collateralType?.maturity),
    yield: calcYield(collateralValue, BigNumber.from(auctionStatus?.price.toString())),
    action: { isActive: collateralAuction.isActive, id: collateralAuction.id },
    collateral: {
      address: collateralAuction.collateralType?.address ?? '',
      symbol: collateralAuction.collateralType?.symbol ?? '',
    },
    underlier: {
      address: collateralAuction.collateralType?.underlierAddress ?? null,
      symbol: collateralAuction.collateralType?.underlierSymbol ?? '',
    },
  } as AuctionData
}

export { wrangleAuction }
