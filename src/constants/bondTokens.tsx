import { ChainsValues } from '@/src/constants/chains'
import { Maybe } from '@/types/utils'
import { metadataByNetwork } from '@/metadata'
import { memoize } from 'lodash'

type NetworkMetadata = {
  [vaultAddress: string]: {
    protocol: string
    asset: string
    symbol: string
    decimals: number
    name: string
    tokenIds: Array<string>
    icons: {
      protocol: string
      asset: string
    }
    urls: {
      project: string
      asset: string
    }
  }
}

export interface ProtocolFilter {
  protocolName: string
  isActive: boolean
  iconLink: string
}

const getVaults = memoize((appChainId: ChainsValues): Record<string, any> => {
  const vaultsMetadata = metadataByNetwork[appChainId] as NetworkMetadata

  if (vaultsMetadata === undefined) {
    return {}
  }

  return Object.fromEntries(
    Object.entries(vaultsMetadata).map(([vaultAddress, metadata]) => [
      // transform addresses to lowerCase
      vaultAddress.toLowerCase(),
      metadata,
    ]),
  )
})

// memoized as the metadata information will remain unchanged from build to build
// so, we need to only re-execute the search if the `chainId` changes
export const getCollateralMetadata = (
  appChainId: ChainsValues,
  {
    tokenId,
    vaultAddress,
  }: {
    tokenId?: Maybe<string>
    vaultAddress?: Maybe<string>
  },
) => {
  const vaults = getVaults(appChainId)

  if (!vaultAddress || !tokenId || !metadataByNetwork || Object.keys(vaults).length === 0) {
    return
  }

  return vaults[vaultAddress.toLowerCase()]
}

/// Returns primary and secondary icon links for asset with name protocolName
export const getPTokenIconFromMetadata = (
  appChainId: ChainsValues,
  protocolName?: string,
): { protocol: string; asset: string; underlier: string } | undefined => {
  if (!metadataByNetwork || !protocolName) {
    return
  }

  const vaults = getVaults(appChainId)
  const vaultMetadatas = Object.values(vaults)
  const vaultMetadataForProtocol = vaultMetadatas.find((metadata) => {
    return metadata.name === protocolName
  })

  return vaultMetadataForProtocol?.icons
}

export const getVaultAddresses = memoize((appChainId: ChainsValues) => {
  const vaults = getVaults(appChainId)
  return Object.keys(vaults)
})

export const getInitialProtocolFilters = memoize(
  (appChainId: ChainsValues): Array<ProtocolFilter> => {
    const vaults = getVaults(appChainId)

    const protocolNamesSeen = new Set()
    const initialProtocolFilters: Array<any> = []
    Object.values(vaults).forEach((vaultMetadata) => {
      const protocolName = vaultMetadata.protocol
      if (!protocolNamesSeen.has(protocolName)) {
        // If we haven't seen this protocol yet, add it to the initialProtocolFilters
        const protocolFilter = {
          protocolName,
          iconLink: vaultMetadata.icons.protocol,
          isActive: true,
        } as ProtocolFilter
        initialProtocolFilters.push(protocolFilter)
        protocolNamesSeen.add(protocolName)
      }
    })

    return initialProtocolFilters as Array<ProtocolFilter>
  },
)

// for parsing decimals from a string scale (for ex. collateral.scale => "1000000")
export const getDecimalsFromScale = (scale: Maybe<string>): number => {
  if (scale === null) {
    return 0
  }
  return Math.log10(Number.parseInt(scale))
}
