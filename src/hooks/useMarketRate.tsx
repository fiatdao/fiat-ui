import { useUnderlierToFCash } from '@/src/hooks/underlierToFCash'
import { useUnderlierToFYToken } from '@/src/hooks/useUnderlierToFYToken'
import { useUnderlierToPToken } from '@/src/hooks/useUnderlierToPToken'
import BigNumber from 'bignumber.js'
import { Collateral } from '@/src/utils/data/collaterals'
import { getNonHumanValue, getHumanValue } from '@/src/web3/utils'
import { ONE_BIG_NUMBER, ZERO_BIG_NUMBER } from '@/src/constants/misc'

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
  const singleUnderlier = new BigNumber(1)
  switch (params.protocol) {
    case "ELEMENT": {
      const [underlierToPToken] = useUnderlierToPToken({
        vault: params.collateral?.vault?.address ?? '',
        balancerVault: params.collateral?.eptData?.balancerVault,
        curvePoolId: params.collateral?.eptData?.poolId,
        underlierAmount: getNonHumanValue(singleUnderlier, params.underlierDecimals),
      })
      return {
        marketRateTokenScale: underlierToPToken, 
        marketRateDecimal: ONE_BIG_NUMBER.div(getHumanValue(underlierToPToken, params.underlierDecimals))
      }
    }
    case "YIELD": {
      const [underlierToFYToken] = useUnderlierToFYToken({
        underlierAmount: getNonHumanValue(singleUnderlier, params.underlierDecimals),
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
        amount: getNonHumanValue(singleUnderlier, params.underlierDecimals),
      })
      return {
        marketRateTokenScale: underlierToFCash, 
        marketRateDecimal: ONE_BIG_NUMBER.div(getHumanValue(underlierToFCash, 8)) //TODO: This needs to not be hardcoded
      }
    }
    default: 
      return {
        marketRateTokenScale: ZERO_BIG_NUMBER, 
        marketRateDecimal: ZERO_BIG_NUMBER
      }
  }
}




