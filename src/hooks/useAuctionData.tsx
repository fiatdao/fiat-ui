import BN from 'bignumber.js'
import { BigNumber } from 'ethers'
import Link from 'next/link'
import { ReactNode, useEffect, useState } from 'react'
import useSWR from 'swr'
import { userAuctions } from '@/types/subgraph/__generated__/userAuctions'
import { USER_AUCTIONS } from '@/src/queries/userAuctions'
import contractCall from '@/src/utils/contractCall'
import { contracts } from '@/src/constants/contracts'
import ButtonGradient from '@/src/components/antd/button-gradient'
import { ChainsValues } from '@/src/constants/chains'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { graphqlFetcher } from '@/src/utils/graphqlFetcher'
import isDev from '@/src/utils/isDev'
import { getHumanValue } from '@/src/web3/utils'

type AuctionData = {
  id: string
  protocol: string
  asset: string
  upForAuction: string
  price: string
  currentValue: string
  profit: string
  action: ReactNode
}

const bigNumberHelper = (value: BigNumber | null) =>
  value?._isBigNumber ? new BN(value.toString()) : new BN(0)

const calcProfit = (currentValue: BigNumber | null, auctionPrice: BigNumber | null) => {
  return bigNumberHelper(currentValue)
    .minus(bigNumberHelper(auctionPrice))
    .dividedBy(bigNumberHelper(auctionPrice))
}
/**
 *
 * @param cols
 * @param provider
 * @param appChainId
 */
const transformCollaterals = async (
  cols: userAuctions,
  provider: any,
  appChainId: ChainsValues,
): Promise<AuctionData[]> => {
  const {
    abi: collybusAbi,
    address: { [appChainId]: collybusAddress },
  } = contracts.COLLYBUS

  const {
    abi: collateralAuctionAbi,
    address: { [appChainId]: collateralAuctionAddress },
  } = contracts.COLLATERAL_AUCTION

  return await Promise.all(
    cols.userAuctions.map(async (userAuction) => {
      const vaultAddress = userAuction.vault?.address
      const underlierAddress = userAuction.collateral?.underlierAddress
      const tokenId = userAuction.collateral?.tokenId
      const maturity = BigNumber.from(Math.round(Date.now() / 1000))

      const currentValue: BigNumber | null = await contractCall(
        collybusAddress,
        collybusAbi,
        provider,
        'read',
        [vaultAddress, underlierAddress, tokenId, maturity, false],
      )

      const auctionStatus = await contractCall(
        collateralAuctionAddress,
        collateralAuctionAbi,
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
        upForAuction: getHumanValue(bigNumberHelper(auctionStatus.collateralToSell), 18)
          ?.decimalPlaces(0)
          .toString(),
        price: getHumanValue(bigNumberHelper(auctionStatus.price), 18)?.decimalPlaces(2).toString(),
        currentValue: getHumanValue(bigNumberHelper(currentValue), 18)?.decimalPlaces(2).toString(),
        profit: getHumanValue(calcProfit(currentValue, auctionStatus.price))
          ?.decimalPlaces(2)
          .toString(),
        action: (
          <Link href={`/auctions/${vaultAddress}/liquidate`} passHref>
            <ButtonGradient>Liquidate</ButtonGradient>
          </Link>
        ),
      } as AuctionData
    }),
  )
}

const getUserAuctions = async () => {
  // TODO userAddress as params here
  return await graphqlFetcher<userAuctions, null>(USER_AUCTIONS, null)
}

export const useAuctionData = () => {
  const [auctionData, setAuctionData] = useState<AuctionData[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [areError, setAreError] = useState<any>(false)
  const { appChainId, readOnlyAppProvider: provider } = useWeb3Connection()

  const { data, error } = useSWR(['auctionPageData'], async () => {
    const userAuctions = await getUserAuctions()
    return transformCollaterals(userAuctions, provider, appChainId)
  })

  if (isDev()) {
    console.log('Fetche Response', {
      swrKey: 'auctionPageData',
      response: data,
      error,
    })
  }

  useEffect(() => {
    if (error) {
      setAreError(error)
      setIsLoading(false)
    }
    if (data) {
      setIsLoading(false)
      setAreError(false)
      setAuctionData(data)
    }
  }, [data, error])

  return { data: auctionData, error: areError, loading: isLoading }
}
