import {
  FDTToken,
  KNOWN_TOKENS,
  KnownTokens,
  gOHMFdtSLPToken,
  gOHMToken,
  wsOHMFdtSLPToken,
  wsOHMToken,
} from '../constants/knownTokens'
import React, { FC, createContext, useCallback, useContext, useEffect } from 'react'
import BigNumber from 'bignumber.js'
import { formatUSD } from '@/src/web3/utils'
import { TokenMeta } from '@/types/token'

export function getKnownTokens(): TokenMeta[] {
  return [...KNOWN_TOKENS]
}

type ContextType = {
  tokens: TokenMeta[]
  version: number
  getTokenBySymbol(symbol: string): TokenMeta | undefined
  getTokenByAddress(address: string): TokenMeta | undefined
  getTokenPriceIn(source: string, target: string): BigNumber | undefined
  convertTokenIn(
    amount: BigNumber | undefined,
    source: string,
    target: string,
  ): BigNumber | undefined
  convertTokenInUSD(amount: BigNumber | undefined, source: string): BigNumber | undefined
}

const Context = createContext<ContextType>({
  tokens: [...KNOWN_TOKENS],
  version: 0,
  getTokenBySymbol: () => undefined,
  getTokenByAddress: () => undefined,
  getTokenPriceIn: () => undefined,
  convertTokenIn: () => undefined,
  convertTokenInUSD: () => undefined,
})

export function useKnownTokens(): ContextType {
  return useContext<ContextType>(Context)
}

export function getTokenBySymbol(symbol: string): TokenMeta | undefined {
  return KNOWN_TOKENS.find((token) => token.symbol === symbol)
}

export function getTokenByAddress(address: string): TokenMeta | undefined {
  return KNOWN_TOKENS.find((token) => token.address.toLowerCase() === address.toLowerCase())
}

// ToDo: Check the ENTR price calculation
async function getFdtPrice(): Promise<BigNumber> {
  const priceFeedContract = {} as any

  const [token0, { 0: reserve0, 1: reserve1 }] = await priceFeedContract.batch([
    { method: 'token0' },
    { method: 'getReserves' },
  ])

  let fdtReserve
  let gOHMReserve

  if (String(token0).toLowerCase() === FDTToken.address) {
    fdtReserve = new BigNumber(reserve0).unscaleBy(FDTToken.decimals)
    gOHMReserve = new BigNumber(reserve1).unscaleBy(gOHMToken.decimals)
  } else {
    fdtReserve = new BigNumber(reserve1).unscaleBy(FDTToken.decimals)
    gOHMReserve = new BigNumber(reserve0).unscaleBy(gOHMToken.decimals)
  }

  if (!gOHMReserve || !fdtReserve || fdtReserve.eq(BigNumber.ZERO)) {
    return BigNumber.ZERO
  }

  gOHMReserve = (gOHMReserve as BigNumber).times(gOHMToken?.price as BigNumber)

  return gOHMReserve.dividedBy(fdtReserve)
}

// ToDo: Check the SLP price calculation
async function getWSOHMFdtSLPPrice(): Promise<BigNumber> {
  const priceFeedContract = {} as any

  const [decimals, totalSupply, token0, { 0: reserve0, 1: reserve1 }] =
    await priceFeedContract.batch([
      { method: 'decimals', transform: Number },
      { method: 'totalSupply', transform: (value: string) => new BigNumber(value) },
      { method: 'token0' },
      { method: 'getReserves' },
    ])

  let wsOHMReserve

  if (String(token0).toLowerCase() === FDTToken.address) {
    wsOHMReserve = new BigNumber(reserve1).unscaleBy(wsOHMToken.decimals)
  } else {
    wsOHMReserve = new BigNumber(reserve0).unscaleBy(wsOHMToken.decimals)
  }

  wsOHMReserve = (wsOHMReserve as BigNumber).times(wsOHMToken?.price as BigNumber)

  const supply = totalSupply.unscaleBy(decimals)

  if (!wsOHMReserve || !supply || supply.eq(BigNumber.ZERO)) {
    return BigNumber.ZERO
  }

  return wsOHMReserve.div(supply).times(2)
}

async function getGOHMFdtSLPTokenPrice(): Promise<BigNumber> {
  const priceFeedContract = {} as any

  const [decimals, totalSupply, token0, { 0: reserve0, 1: reserve1 }] =
    await priceFeedContract.batch([
      { method: 'decimals', transform: Number },
      { method: 'totalSupply', transform: (value: string) => new BigNumber(value) },
      { method: 'token0' },
      { method: 'getReserves' },
    ])

  let gOHMAmphoraReserve

  if (String(token0).toLowerCase() === FDTToken.address) {
    gOHMAmphoraReserve = new BigNumber(reserve1).unscaleBy(gOHMToken.decimals)
  } else {
    gOHMAmphoraReserve = new BigNumber(reserve0).unscaleBy(gOHMToken.decimals)
  }

  gOHMAmphoraReserve = (gOHMAmphoraReserve as BigNumber).times(gOHMToken?.price as BigNumber)

  const supply = totalSupply.unscaleBy(decimals)

  if (!gOHMAmphoraReserve || !supply || supply.eq(BigNumber.ZERO)) {
    return BigNumber.ZERO
  }

  return gOHMAmphoraReserve.div(supply).times(2)
}

export function getTokenPrice(symbol: string): BigNumber | undefined {
  return getTokenBySymbol(symbol)?.price
}

export function getTokenPriceIn(source: string, target: string): BigNumber | undefined {
  const sourcePrice = getTokenPrice(source)
  const targetPrice = getTokenPrice(target)

  if (!sourcePrice || !targetPrice) {
    return undefined
  }

  return sourcePrice.dividedBy(targetPrice)
}

export function convertTokenIn(
  amount: BigNumber | number | undefined,
  source: string,
  target: string,
): BigNumber | undefined {
  if (amount === undefined || amount === null) {
    return undefined
  }

  if (amount === 0 || BigNumber.ZERO.eq(amount)) {
    return BigNumber.ZERO
  }

  const bnAmount = new BigNumber(amount)

  if (bnAmount.isNaN()) {
    return undefined
  }

  if (source === target) {
    return bnAmount
  }

  const price = getTokenPriceIn(source, target)

  if (!price) {
    return undefined
  }

  return bnAmount.multipliedBy(price)
}

export function convertTokenInUSD(
  amount: BigNumber | number | undefined,
  source: string,
): BigNumber | undefined {
  return convertTokenIn(amount, source, KnownTokens.USDC)
}

const KnownTokensProvider: FC = (props) => {
  const { children } = props

  const fetchPrices = useCallback(async () => {
    const ids = KNOWN_TOKENS.map((tk) => tk.coinGeckoId)
      .filter(Boolean)
      .join(',')

    try {
      const prices = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
      ).then((res) => res.json())

      KNOWN_TOKENS.forEach((token) => {
        if (token.coinGeckoId) {
          const price = prices[token.coinGeckoId]?.usd

          if (price) {
            token.price = new BigNumber(price)
          }
        }
      })

      FDTToken.price = await getFdtPrice().catch(() => undefined)
      // EthFdtSLPToken.price = await getEthFdtSLPPrice().catch(() => undefined);
      wsOHMFdtSLPToken.price = await getWSOHMFdtSLPPrice().catch(() => undefined)
      gOHMFdtSLPToken.price = await getGOHMFdtSLPTokenPrice().catch(() => undefined)

      KNOWN_TOKENS.forEach((token) => {
        console.log(`[Token Price] ${token.symbol} = ${formatUSD(token.price)}`)
      })
    } catch (e) {
      console.error(e)
    }
  }, [])

  useEffect(() => {
    fetchPrices()
  }, [fetchPrices])

  const value = {
    tokens: [...KNOWN_TOKENS],
    version: 1,
    getTokenBySymbol,
    getTokenByAddress,
    getTokenPriceIn,
    convertTokenIn,
    convertTokenInUSD,
    refreshPrices: fetchPrices,
  }

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export default KnownTokensProvider
