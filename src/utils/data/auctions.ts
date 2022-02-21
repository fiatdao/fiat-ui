import { JsonRpcProvider } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import { auctionById_userAuction as subGraphAuction } from '@/types/subgraph/__generated__/auctionById'
import { auctions_userAuctions as subGraphAuctions } from '@/types/subgraph/__generated__/auctions'
import { ChainsValues } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import contractCall from '@/src/utils/contractCall'
import { getHumanValue } from '@/src/web3/utils'
import { CollateralAuction, Collybus } from '@/types/typechain'
type AuctionData = {
  id: string
  protocol?: string
  asset?: string
  upForAuction?: string
  price?: string
  collateralValue?: string
  profit?: string
  action: { isActive: boolean; id: number | string }
  tokenAddress?: string | null
}

const calcProfit = (collateralValue: BigNumber | null, auctionPrice: BigNumber | null) => {
  if (collateralValue === null || auctionPrice === null) {
    return ZERO_BIG_NUMBER
  }

  return collateralValue.minus(auctionPrice).dividedBy(auctionPrice)
}

const getCollateralValueFromCollybus = async (
  provider: JsonRpcProvider,
  appChainId: ChainsValues,
  tokenId: string | null | undefined,
  underlierAddress: string | null | undefined,
  vaultAddress: string | null | undefined,
): Promise<BigNumber> => {
  const maturity = Math.round(Date.now() / 1000)

  let collateralValue = ZERO_BIG_NUMBER
  if (
    typeof vaultAddress === 'string' &&
    typeof underlierAddress === 'string' &&
    typeof tokenId === 'string'
  ) {
    const _collateralValue = await contractCall<Collybus, 'read'>(
      contracts.COLLYBUS.address[appChainId],
      contracts.COLLYBUS.abi,
      provider,
      'read',
      [vaultAddress, underlierAddress, tokenId, maturity, false],
    )

    if (_collateralValue) {
      collateralValue = BigNumber.from(_collateralValue.toString()) as BigNumber
    }
  }

  return collateralValue as BigNumber
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
  const vaultAddress = userAuction.vault?.address
  const underlierAddress = userAuction.collateral?.underlierAddress
  const tokenId = userAuction.collateral?.tokenId

  const collateralValue = await getCollateralValueFromCollybus(
    provider,
    appChainId,
    tokenId,
    underlierAddress,
    vaultAddress,
  )

  const auctionStatus = await getAuctionStatus(appChainId, provider, userAuction.id)

  // TODO is necessary extract decimals places?

  return {
    id: userAuction.id,
    protocol: userAuction.vault?.name,
    asset: userAuction.collateral?.symbol,
    upForAuction: getHumanValue(
      BigNumber.from(auctionStatus?.collateralToSell.toString()),
      18,
    )?.toFormat(0),
    price: getHumanValue(BigNumber.from(auctionStatus?.price.toString()), 18)?.toFormat(2),
    collateralValue: getHumanValue(BigNumber.from(collateralValue?.toString()), 18)?.toFormat(2),
    profit: getHumanValue(
      calcProfit(collateralValue, BigNumber.from(auctionStatus?.price.toString()) ?? null),
    )?.toFormat(2),
    action: { isActive: userAuction.isActive, id: userAuction.id },
    tokenAddress: underlierAddress,
  } as AuctionData
}

export { wrangleAuction }
