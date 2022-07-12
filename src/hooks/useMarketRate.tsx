import { useUnderlierToFCash } from '@/src/hooks/underlierToFCash'
import { useUnderlierToFYToken } from '@/src/hooks/useUnderlierToFYToken'
import { useUnderlierToPToken } from '@/src/hooks/useUnderlierToPToken'
import BigNumber from 'bignumber.js'
import { Collateral } from '@/src/utils/data/collaterals'
import { getNonHumanValue, getHumanValue } from '@/src/web3/utils'
import { ONE_BIG_NUMBER } from '@/src/constants/misc'

type MarketRateParams = {
  protocol: string // "NOTIONAL" | "YIELD" | "ELEMENT"
  collateral: Collateral
  underlierDecimals: number | undefined
}

type MarketRateReturnValue = {
  marketRateTokenScale: BigNumber
  marketRateDecimal: BigNumber
}

export const useMarketRate = (params: MarketRateParams): MarketRateReturnValue => {
  switch (params.protocol) {
    case "ELEMENT": {
      const [underlierToPToken] = useUnderlierToPToken({
        vault: params.collateral?.vault?.address ?? '',
        balancerVault: params.collateral?.eptData?.balancerVault,
        curvePoolId: params.collateral?.eptData?.poolId,
        underlierAmount: getNonHumanValue(new BigNumber(1), params.underlierDecimals), //single underlier value
      })
      return {
        marketRateTokenScale: underlierToPToken, 
        marketRateDecimal: ONE_BIG_NUMBER.div(getHumanValue(underlierToPToken, params.underlierDecimals))
      }
    }
    case "YIELD": {
      const [underlierToFYToken] = useUnderlierToFYToken({
        underlierAmount: getNonHumanValue(new BigNumber(1), params.underlierDecimals), //single underlier value
        yieldSpacePool: params.collateral.fyData.yieldSpacePool,
      })
      return {
        marketRateTokenScale: underlierToFYToken, 
        marketRateDecimal: ONE_BIG_NUMBER.div(getHumanValue(underlierToFYToken, params.underlierDecimals))
      }
    }
    case "NOTIONAL": {
      const [underlierToFCash] = useUnderlierToFCash({
        tokenId: params.collateral.tokenId ?? '',
        amount: getNonHumanValue(new BigNumber(1), params.underlierDecimals), //single underlier value
      })
      return {
        marketRateTokenScale: underlierToFCash, 
        marketRateDecimal: ONE_BIG_NUMBER.div(getHumanValue(underlierToFCash, 77))
      }
    }
  }
}




