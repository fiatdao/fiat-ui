import s from './s.module.scss'
import cn from 'classnames'

import DAI from '@/src/components/custom/asset-icons/resources/dai.svg'
import EPYV from '@/src/components/custom/asset-icons/resources/epyv.svg'
import FDAI from '@/src/components/custom/asset-icons/resources/fdai.svg'
import SBOND from '@/src/components/custom/asset-icons/resources/sbond.svg'
import USDC from '@/src/components/custom/asset-icons/resources/usdc.svg'

const getAsset = (asset: string) => {
  return asset === 'DAI' ? (
    <DAI />
  ) : asset === 'EPYV' ? (
    <EPYV />
  ) : asset === 'FDAI' ? (
    <FDAI />
  ) : asset === 'SBOND' ? (
    <SBOND />
  ) : asset === 'USDC' ? (
    <USDC />
  ) : null
}

export const AssetIcons: React.FC<{
  className?: string
  dimensions?: string
  mainAsset: string
  secondaryAsset: string
}> = ({ className, dimensions, mainAsset, secondaryAsset, ...restProps }) => {
  return (
    <div
      className={cn(s.component, className)}
      style={dimensions ? { width: dimensions, height: dimensions } : undefined}
      {...restProps}
    >
      <div className={cn(s.mainAsset)}>{getAsset(mainAsset)}</div>
      <div className={cn(s.secondaryAsset)}>{getAsset(secondaryAsset)}</div>
    </div>
  )
}
