import BigNumber from 'bignumber.js'
import Link from 'next/link'
import { ReactNode } from 'react'
import useSWR from 'swr'
import { auctionById, auctionByIdVariables } from '@/types/subgraph/__generated__/auctionById'
import { AUCTION_BY_ID } from '@/src/queries/auctions'
import { PROTOCOLS, Protocol } from '@/types/protocols'
import { ZERO_BIG_NUMBER } from '@/src/constants/misc'
import { CollateralAuction, Collybus } from '@/types/typechain'
import { userAuctions } from '@/types/subgraph/__generated__/userAuctions'
import { USER_AUCTIONS } from '@/src/queries/userAuctions'
import contractCall from '@/src/utils/contractCall'
import { contracts } from '@/src/constants/contracts'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { ChainsValues } from '@/src/constants/chains'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import { getHumanValue } from '@/src/web3/utils'

type AuctionData = {
  id: string
  protocol?: string
  asset?: string
  upForAuction?: string
  price?: string
  currentValue?: string
  profit?: string
  action: ReactNode
}

const calcProfit = (currentValue: BigNumber | null, auctionPrice: BigNumber | null) => {
  if (currentValue === null || auctionPrice === null) {
    return ZERO_BIG_NUMBER
  }

  return currentValue.minus(auctionPrice).dividedBy(auctionPrice)
}
/**
 *
 * @param cols
 * @param provider
 * @param appChainId
 */
const transformAuctions = async (
  cols: userAuctions,
  provider: any,
  appChainId: ChainsValues,
): Promise<AuctionData[]> => {
  return Promise.all(
    cols.userAuctions.map(async (userAuction) => {
      const vaultAddress = userAuction.vault?.address
      const underlierAddress = userAuction.collateral?.underlierAddress
      const tokenId = userAuction.collateral?.tokenId
      const maturity = Math.round(Date.now() / 1000)

      let currentValue = ZERO_BIG_NUMBER
      if (
        typeof vaultAddress === 'string' &&
        typeof underlierAddress === 'string' &&
        typeof tokenId === 'string'
      ) {
        const _currentValue = await contractCall<Collybus, 'read'>(
          contracts.COLLYBUS.address[appChainId],
          contracts.COLLYBUS.abi,
          provider,
          'read',
          [vaultAddress, underlierAddress, tokenId, maturity, false],
        )

        if (_currentValue) {
          currentValue = BigNumber.from(_currentValue.toString()) as BigNumber
        }
      }

      const auctionStatus = await contractCall<CollateralAuction, 'getStatus'>(
        // TODO: it should be NON_LOSS_COLLATERAL_AUCTION
        contracts.COLLATERAL_AUCTION.address[appChainId],
        contracts.COLLATERAL_AUCTION.abi,
        provider,
        'getStatus',
        [userAuction.id],
      )

      // TODO is necessary extract decimals places?
      // const decimalPlaces = await contractCall(
      //   underlierAddress,
      //   contracts.ERC_20.abi,
      //   provider,
      //   'decimals',
      //   null,
      // )

      return {
        id: userAuction.id,
        protocol: userAuction.vault?.name,
        asset: userAuction.collateral?.symbol,
        upForAuction: getHumanValue(
          BigNumber.from(auctionStatus?.collateralToSell.toString()),
          18,
        )?.toFormat(0),
        price: getHumanValue(BigNumber.from(auctionStatus?.price.toString()), 18)?.toFormat(2),
        currentValue: getHumanValue(BigNumber.from(currentValue?.toString()), 18)?.toFormat(2),
        profit: getHumanValue(
          calcProfit(currentValue, BigNumber.from(auctionStatus?.price.toString()) ?? null),
        )?.toFormat(2),
        // TODO: disable Link when button is disabled?
        action: (
          <Link href={`/auctions/${vaultAddress}/liquidate`} passHref>
            <ButtonGradient disabled={!userAuction.isActive}>
              {userAuction.isActive ? 'Liquidate' : 'Not Available'}
            </ButtonGradient>
          </Link>
        ),
      } as AuctionData
    }),
  )
}

const getAuctionById = async (auctionId: string) => {
  return await graphqlFetcher<auctionById, auctionByIdVariables>(AUCTION_BY_ID, { id: auctionId })
}

const getUserAuctions = async (activeFilters: any) => {
  // TODO userAddress as params here
  console.log(activeFilters)
  return await graphqlFetcher<userAuctions, any>(
    USER_AUCTIONS,
    activeFilters.length
      ? {
          where: { vaultName_in: activeFilters },
        }
      : { where: null },
  )
}

/**
 * gets data for auctions page (list of auctions)
 */
export const useAuctionsData = (activeFilters: Protocol[]) => {
  const { appChainId, readOnlyAppProvider: provider } = useWeb3Connection()

  const { data, error } = useSWR(
    ['auctionsPageData', activeFilters.length === PROTOCOLS.length ? [] : activeFilters],
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
  const { data, error } = useSWR(['auctionPageData', auctionId], () => getAuctionById(auctionId))

  return { data, error: !!error, loading: !data && !error }
}
