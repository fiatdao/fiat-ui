import { Collateral } from '@/src/utils/data/collaterals'
import { getHumanValue, getNonHumanValue } from '@/src/web3/utils'
import { ONE_BIG_NUMBER } from '@/src/constants/misc'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { contracts } from '@/src/constants/contracts'
import useContractCall from '@/src/hooks/contracts/useContractCall'
import BigNumber from 'bignumber.js'

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
  const { appChainId } = useWeb3Connection()

  let contract
  let abi
  let contractCall
  let contractParams
  let underlierDecimals

  switch (params.protocol) {
    case 'ELEMENT': {
      contract = contracts.USER_ACTIONS_EPT.address[appChainId]
      abi = contracts.USER_ACTIONS_EPT.abi
      contractCall = 'underlierToPToken'
      underlierDecimals = params.underlierDecimals

      const vault = params.collateral?.vault?.address ?? ''
      const balancerVault = params.collateral?.eptData?.balancerVault
      const underlierAmount = getNonHumanValue(singleUnderlier, params.underlierDecimals)
      const curvePoolId = params.collateral?.eptData?.poolId
      contractParams = [vault, balancerVault, curvePoolId, underlierAmount.toFixed(0, 8)]
      break
    }
    case 'YIELD': {
      contract = contracts.USER_ACTIONS_FY.address[appChainId]
      abi = contracts.USER_ACTIONS_FY.abi
      contractCall = 'underlierToFYToken'
      underlierDecimals = params.underlierDecimals

      const underlierAmount = getNonHumanValue(singleUnderlier, params.underlierDecimals)
      const yieldSpacePool = params.collateral.fyData.yieldSpacePool
      contractParams = [underlierAmount.toFixed(0, 8), yieldSpacePool]
      break
    }
    case 'NOTIONAL': {
      contract = contracts.USER_ACTIONS_FC.address[appChainId]
      abi = contracts.USER_ACTIONS_FC.abi
      contractCall = 'underlierToFCash'
      underlierDecimals = 8

      const tokenId = params.collateral.tokenId ?? ''
      const amount = getNonHumanValue(singleUnderlier, params.underlierDecimals)
      contractParams = [tokenId, amount.toFixed(0, 8)]
      break
    }
  }

  const [marketRateTokenScale] = useContractCall(
    contract || '',
    abi || '',
    contractCall || '',
    contractParams || null,
  ) ?? ['ZERO_BIG_NUMBER', null]

  const marketRateDecimal = ONE_BIG_NUMBER.div(
    getHumanValue(marketRateTokenScale, underlierDecimals),
  )
  return { marketRateTokenScale, marketRateDecimal }
}
