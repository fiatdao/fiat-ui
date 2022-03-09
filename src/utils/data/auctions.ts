import { JsonRpcProvider } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { getCurrentValue } from '@/src/utils/getCurrentValue'
import { auctionById_collateralAuction as subGraphAuction } from '@/types/subgraph/__generated__/auctionById'
import { auctions_collateralAuctions as subGraphAuctions } from '@/types/subgraph/__generated__/auctions'
import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import contractCall from '@/src/utils/contractCall'
import { getHumanValue } from '@/src/web3/utils'
import { CollateralAuction } from '@/types/typechain'
import { TokenData } from '@/types/token'

export type AuctionData = {
  id: string
  protocol?: string
  asset?: string
  upForAuction?: string
  price?: string
  collateralValue?: string
  tokenId?: string
  yield?: string
  vault?: { address: string; name?: string }
  action: { isActive: boolean; id: number | string }
  tokenAddress?: string | null
  collateral: TokenData
  underlier: TokenData
}

const calcYield = (collateralValue: BigNumber | null, auctionPrice: BigNumber | null) => {
  if (collateralValue === null || auctionPrice === null) {
    return ZERO_BIG_NUMBER
  }

  return collateralValue.minus(auctionPrice).dividedBy(auctionPrice)
}

const getAuctionStatus = (
  appChainId: ChainsValues,
  provider: JsonRpcProvider,
  auctionId: string,
): Promise<ReturnType<CollateralAuction['getStatus']> | null> => {
  return contractCall<CollateralAuction, 'getStatus'>(
    // TODO: it should be NON_LOSS_COLLATERAL_AUCTION
    contracts.COLLATERAL_AUCTION.address[appChainId],
    contracts.COLLATERAL_AUCTION.abi,
    provider,
    'getStatus',
    [Number(auctionId)],
  )
}

const wrangleAuction = async (
  userAuction: subGraphAuctions | subGraphAuction,
  provider: JsonRpcProvider,
  appChainId: ChainsValues,
) => {
  const vaultAddress = userAuction.vault?.address || null
  const underlierAddress = userAuction.collateralType?.underlierAddress || null
  const tokenId = userAuction.collateralType?.tokenId || 0

  const collateralValue = await getCurrentValue(provider, appChainId, tokenId, vaultAddress, false)

  const auctionStatus = await getAuctionStatus(appChainId, provider, userAuction.id)

  // TODO is necessary extract decimals places?

  return {
    id: userAuction.id,
    protocol: userAuction.vault?.name,
    tokenId: userAuction?.tokenId,
    vault: { address: userAuction.vault?.address, name: userAuction.vault?.name },
    asset: userAuction.collateralType?.symbol,
    upForAuction: getHumanValue(
      BigNumber.from(auctionStatus?.collateralToSell.toString()),
      18,
    )?.toFormat(0),
    price: getHumanValue(BigNumber.from(auctionStatus?.price.toString()), 18)?.toFormat(2),
    collateralValue: getHumanValue(BigNumber.from(collateralValue?.toString()), 18)?.toFormat(2),
    yield: getHumanValue(
      calcYield(collateralValue, BigNumber.from(auctionStatus?.price.toString()) ?? null),
    )?.toFormat(2),
    action: { isActive: userAuction.isActive, id: userAuction.id },
    tokenAddress: underlierAddress,
    collateral: {
      symbol: userAuction.collateralType?.symbol ?? '',
    },
    underlier: {
      symbol: userAuction.collateralType?.underlierSymbol ?? '',
    },
  } as AuctionData
}

export { wrangleAuction }
