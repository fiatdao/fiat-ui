import { memoize } from 'lodash'
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
//     }
//   }
// }

// type MetadataByNetwork = {
//   [chainId: number]: PTokenMap
// }

// TODO: Create interface that can support all token types
const getVaults = memoize((appChainId: ChainsValues): Record<string, any> => {
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

  // lookup by vaultAddress and tokenId
  return vaults[vaultAddress.toLowerCase()]?.[tokenId]
}

/// Returns primary and secondary icon links for asset with name protocolName
/// Should look like {main: <main_link>, secondary: <secondary_link}
/// @ts-ignore: The `memoize` function caches only the first argument. Putting `appChainId` in front of the optional `protocolName` param
/// results in incorrect outputs
export const getPTokenIconFromMetadata = memoize(
  (protocolName?: string, appChainId: ChainsValues) => {
    if (!metadataByNetwork || !protocolName) {
      return
    }

    const vaults = getVaults(appChainId)
    const vaultMetadatas = Object.values(vaults)
    const vaultMetadataForProtocol = vaultMetadatas.find((metadata) => {
      return metadata.name === protocolName
    })

    return vaultMetadataForProtocol.icons
  },
)

export const getVaultAddressesByName = memoize((appChainId: ChainsValues, name: string) => {
  const vaults = getVaults(appChainId)

  const uniqueNameAddressMap = Object.fromEntries(
    Object.entries(vaults).map(([vaultAddress, byTokenId]) => {
      // extract the name from the first entry in the tokens map
      const [, { name }] = Object.entries(byTokenId)[0]
      return [name, vaultAddress]
    }),
  )

  return Object.entries(uniqueNameAddressMap)
    .filter(([vaultName]) => vaultName.toLowerCase().startsWith(name.toLowerCase()))
    .map(([, vaultAddress]) => vaultAddress)
})

/// return map of {vaultName: iconLink}
export const getProtocolsWithIcon = memoize((appChainId: ChainsValues) => {
  const vaults = getVaults(appChainId)

  let vaultNameToIconMap = {}
  Object.values(vaults).forEach((vaultMetadata) => {
    const lcName = vaultMetadata.name.split('_')[0].toLowerCase()
    vaultNameToIconMap = Object.assign({ [lcName]: vaultMetadata.icons.main }, vaultNameToIconMap)
  })

  return vaultNameToIconMap
})
