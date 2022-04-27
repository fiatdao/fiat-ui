import { memoize } from 'lodash'
import { ChainsValues } from '@/src/constants/chains'
import { Maybe } from '@/types/utils'
import { metadataByNetwork } from '@/metadata'

type PTokenMap = {
  [vaultAddress: string]: {
    [tokenId: string]: {
      protocol: string
      symbol: string
      decimals: number
      name: string
      icons: {
        main: string
        secondary: string
      }
    }
  }
}

type MetadataByNetwork = {
  [chainId: number]: PTokenMap
}

const getVaults = memoize((appChainId: ChainsValues) => {
  const vaultsMetadata = (metadataByNetwork as MetadataByNetwork)[appChainId]

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
  return vaults[vaultAddress.toLowerCase()][tokenId]
}

export const getPTokenIconFromMetadata = memoize((protocolName?: string) => {
  if (!metadataByNetwork || !protocolName) {
    return
  }

  const iconsByProtocolName: Record<string, { main: string; secondary: string }> =
    Object.fromEntries(
      Object.entries(metadataByNetwork)
        .map(([, byNetwork]) =>
          Object.entries(byNetwork).map(([, metadataByTokenId]) =>
            Object.entries(metadataByTokenId).map(([, metadata]) => [
              metadata.name.toLowerCase(),
              metadata.icons,
            ]),
          ),
        )
        .flat(2),
    )

  return iconsByProtocolName[protocolName.toLowerCase()]
})

export const getVaultAddressesByName = memoize((appChainId: ChainsValues, name: string) => {
  // vaults for the current chain
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

export const getProtocolsWithIcon = memoize((appChainId: ChainsValues) => {
  const vaults = getVaults(appChainId)

  return Object.fromEntries(
    Object.entries(vaults).map(([, byTokenId]) => {
      const [
        ,
        {
          // extracts the `main` icon...
          icons: { main },
          // and the name...
          name,
        },
        // from the first entry in the tokens map
      ] = Object.entries(byTokenId)[0]

      // creates a map with vault's name in lowercase and its icon
      return [name.split('_')[0].toLowerCase(), main]
    }),
  )
})
