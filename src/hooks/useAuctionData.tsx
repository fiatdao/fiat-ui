import { JsonRpcProvider } from '@ethersproject/providers'
import BigNumber from 'bignumber.js'
import Link from 'next/link'
import { ReactNode } from 'react'
import useSWR from 'swr'
import {
  auctionById,
  auctionByIdVariables,
  auctionById_userAuction,
} from '@/types/subgraph/__generated__/auctionById'
import { AUCTION_BY_ID } from '@/src/queries/auction'
import { PROTOCOLS } from '@/types/protocols'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { CollateralAuction, Collybus } from '@/types/typechain'
import { auctions, auctionsVariables } from '@/types/subgraph/__generated__/auctions'
import { AUCTIONS } from '@/src/queries/auctions'
import contractCall from '@/src/utils/contractCall'
import { contracts } from '@/src/constants/contracts'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { ChainsValues } from '@/src/constants/chains'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { getHumanValue } from '@/src/web3/utils'

/******************************/
/*  TYPES                     */
/******************************/

type AuctionData = {
  id: string
  protocol?: string
  asset?: string
  upForAuction?: string
  price?: string
  collateralValue?: string
  profit?: string
  action: ReactNode
}

interface SingleAuctionData {
  id: string
  protocol?: string | null
  asset?: string | null
  upForAuction?: string | null
  price?: string | null
  collateralValue?: string | null
  profit?: string
  collateralToSell?: string | null
  tokenAddress?: string | null
}

type activeFilters = Array<typeof PROTOCOLS[number]>

/******************************/
/* COMMON AND UTILS FUNCTIONS */
/******************************/

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
    [auctionId],
  )
}

/******************************/
/* TRANSFORM DATA FUNCTIONS   */
/******************************/

/**
 *
 * @param cols
 * @param provider
 * @param appChainId
 */
const transformAuctions = async (
  cols: auctions,
  provider: any,
  appChainId: ChainsValues,
): Promise<AuctionData[]> => {
  return Promise.all(
    cols.userAuctions.map(async (userAuction) => {
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
        collateralValue: getHumanValue(BigNumber.from(collateralValue?.toString()), 18)?.toFormat(
          2,
        ),
        profit: getHumanValue(
          calcProfit(collateralValue, BigNumber.from(auctionStatus?.price.toString()) ?? null),
        )?.toFormat(2),
        // TODO: disable Link when button is disabled?
        action: userAuction.isActive ? (
          <Link href={`/auctions/${userAuction.id}/liquidate`} passHref>
            <ButtonGradient>Liquidate</ButtonGradient>
          </Link>
        ) : (
          <ButtonGradient disabled>Not Available</ButtonGradient>
        ),
      } as AuctionData
    }),
  )
}

const transformAuction = async (
  auction: auctionById_userAuction,
  provider: JsonRpcProvider,
  appChainId: ChainsValues,
): Promise<SingleAuctionData> => {
  const vaultAddress = auction.vault?.address
  const underlierAddress = auction.collateral?.underlierAddress
  const tokenId = auction.tokenId
  const collateralToSell = auction.collateralToSell

  const collateralValue = await getCollateralValueFromCollybus(
    provider,
    appChainId,
    tokenId,
    underlierAddress,
    vaultAddress,
  )

  const auctionStatus = await getAuctionStatus(appChainId, provider, auction.id)

  return {
    id: auction.id,
    protocol: auction.vaultName,
    asset: auction?.collateral?.symbol,
    upForAuction: getHumanValue(BigNumber.from(collateralToSell?.toString()), 18)?.toFormat(0),
    price: getHumanValue(BigNumber.from(auctionStatus?.price.toString()), 18)?.toFormat(2),
    collateralValue: getHumanValue(BigNumber.from(collateralValue?.toString()), 18)?.toFormat(2),
    profit: getHumanValue(
      calcProfit(collateralValue, BigNumber.from(auctionStatus?.price.toString()) ?? null),
    )?.toFormat(2),
    collateralToSell: getHumanValue(
      BigNumber.from(auctionStatus?.collateralToSell.toString()),
      18,
    )?.toFormat(4),
    tokenAddress: underlierAddress,
  }
}

/******************************/
/*  GETTER FUNCTIONS          */
/******************************/

const getAuctionById = async (auctionId: string): Promise<auctionById> =>
  graphqlFetcher<auctionById, auctionByIdVariables>(AUCTION_BY_ID, { id: auctionId })

const getUserAuctions = async (activeFilters: activeFilters) =>
  graphqlFetcher<auctions, auctionsVariables>(
    AUCTIONS,
    activeFilters.length
      ? {
          where: { vaultName_in: activeFilters },
        }
      : { where: null },
  )

/******************************/
/*  DATA HOOKS                */
/******************************/

/**
 * gets data for auctions page (list of auctions)
 */
export const useAuctionsData = (activeFilters: activeFilters) => {
  const { appChainId, readOnlyAppProvider: provider } = useWeb3Connection()

  const { data, error } = useSWR(
    [
      'auctionsPageData',
      activeFilters.length === PROTOCOLS.length ? '' : activeFilters.join(),
      appChainId,
      provider,
    ],
    async () => {
      const userAuctions = await getUserAuctions(activeFilters)
      return transformAuctions(userAuctions, provider, appChainId)
    },
  )

  return { data, error: !!error, loading: !data && !error }
}

/**
 * gets data for auction by ID page (liquidate auction)
 */
export const useAuctionData = (auctionId: string) => {
  const {
    address: currentUserAddress,
    appChainId,
    readOnlyAppProvider: provider,
  } = useWeb3Connection()

  const { data, error } = useSWR(
    ['auctionPageData', currentUserAddress, appChainId, provider],
    async () => {
      const { userAuction } = await getAuctionById(auctionId)
      return transformAuction(userAuction as auctionById_userAuction, provider, appChainId)
    },
  )

  return {
    data,
    error: !!error,
    loading: !data && !error,
  }
}
