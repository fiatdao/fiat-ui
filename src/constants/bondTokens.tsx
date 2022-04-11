import { memoize } from 'lodash'
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

// memoized as the metadata information will remain unchanged from build to build
// so, we need to only re-execute the search if the `chainId` changes
export const getCollateralMetadata = memoize(
  (
    appChainId: number,
    {
      tokenId,
      vaultAddress,
    }: {
      tokenId?: Maybe<string>
      vaultAddress?: Maybe<string>
    },
  ) => {
    if (!vaultAddress || !tokenId || !metadataByNetwork) {
      return
    }

    const vaultsMetadata = (metadataByNetwork as MetadataByNetwork)[appChainId]

    const fromEntries = Object.fromEntries(
      Object.entries(vaultsMetadata).map(([vaultAddress, metadata]) => [
        // transform addresses to lowerCase
        vaultAddress.toLowerCase(),
        metadata,
      ]),
    )

    // lookup by vaultAddress and tokenId
    return fromEntries[vaultAddress.toLowerCase()][tokenId]
  },
)

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
