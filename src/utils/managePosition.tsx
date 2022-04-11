import isDev from './isDev'
import { ReactNode } from 'react'
import { useQueryParam } from '@/src/hooks/useQueryParam'
import { Chains } from '@/src/constants/chains'
import { contracts } from '@/src/constants/contracts'
import ElementIcon from '@/src/resources/svg/element.svg'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'

export const iconByAddress = new Proxy<Record<string, ReactNode>>(
  {
    '0xdcf80c068b7ffdf7273d8adae4b076bf384f711a': <ElementIcon />,
    [contracts.FIAT.address[Chains.goerli].toLowerCase()]: <FiatIcon />,
  },
  {
    get: function (target, prop) {
      if (typeof prop === 'string') {
        return target[prop.toLowerCase()]
      }
    },
  },
)

export const isValidPositionIdType = (
  positionId: string | string[] | undefined,
): positionId is string => {
  return typeof positionId === 'string'
}

export const isValidPositionId = (positionId: string | string[] | undefined): boolean => {
  if (!isValidPositionIdType(positionId)) {
    return false
  }

  const positionIdRegex = new RegExp(/^(0x[a-f0-9]{40})-(0x[a-f0-9]{1,40})-(0x[a-f0-9]{40})$/, 'ig')
  return positionIdRegex.test(positionId)
}

export const extractFieldsFromPositionId = (positionId: string) => {
  if (!isValidPositionIdType(positionId) || !isValidPositionId(positionId)) {
    if (isDev()) {
      console.error('Invalid position id')
    }
  }

  const [vaultAddress, tokenId, proxyAddress] = positionId.split('-')

  return { vaultAddress, tokenId, proxyAddress }
}

export const useExtractPositionIdData = (): {
  vaultAddress: string
  tokenId: string
  proxyAddress: string
} => {
  const positionId = useQueryParam('positionId')
  return extractFieldsFromPositionId(positionId)
}
