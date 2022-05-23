import { initial, memoize } from 'lodash'
import { ChainsValues } from '@/src/constants/chains'
import { Maybe } from '@/types/utils'
import { metadataByNetwork } from '@/metadata'

// TODO: Create interface that can support all token types
// type PTokenMap = {
//   [vaultAddress: string]: {
//     [tokenId: string]: {
//       protocol: string
//       asset: string
//       symbol: string
//       decimals: number
//       name: string
//       icons: {
//         main: string
//         secondary: string
//       }
//       urls?: {
//         asset?: string
//         project?: string
//       }
//     }
//   }
// }

// type MetadataByNetwork = {
//   [chainId: number]: PTokenMap
// }

export interface ProtocolFilter {
  protocolName: string
  isActive: boolean
  iconLink: string
}

// TODO: Create interface that can support all token types
const getVaults = memoize(
  (appChainId: ChainsValues): Record<string, any> => {
    // const vaultsMetadata = (metadataByNetwork as MetadataByNetwork)[appChainId]

    const vaultsMetadata = metadataByNetwork[appChainId]

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
  },
)

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

  // seems to be previous structure of vault metadata. keeping here just in case
  // return vaults[vaultAddress.toLowerCase()]?.[tokenId]
  return vaults[vaultAddress.toLowerCase()]
}

/// Returns primary and secondary icon links for asset with name protocolName
/// Return Object should look like {main: <main_link>, secondary: <secondary_link}
/// TODO: memoize. See https://github.com/fiatdao/fiat-ui/issues/520
export const getPTokenIconFromMetadata = (appChainId: ChainsValues, protocolName?: string) => {
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
    let initialProtocolFilters: Array<any> = []
    Object.values(vaults).forEach((vaultMetadata) => {
      const protocolName = vaultMetadata.protocol
      if (!protocolNamesSeen.has(protocolName)) {
        // If we haven't seen this protocol yet, add it to the initialProtocolFilters
        const protocolFilter = {
          protocolName,
          iconLink: vaultMetadata.icons.main,
          isActive: false,
        } as ProtocolFilter
        initialProtocolFilters.push(protocolFilter)
        protocolNamesSeen.add(protocolName)
      }
    })

    return initialProtocolFilters as Array<ProtocolFilter>
  },
)
