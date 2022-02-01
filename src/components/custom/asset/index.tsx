import s from './s.module.scss'
import cn from 'classnames'

import DAI from '@/src/components/custom/asset/resources/dai.svg'
import EPYV from '@/src/components/custom/asset/resources/epyv.svg'
import FDAI from '@/src/components/custom/asset/resources/fdai.svg'
import SBOND from '@/src/components/custom/asset/resources/sbond.svg'
import USDC from '@/src/components/custom/asset/resources/usdc.svg'

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

export const Asset: React.FC<{
  className?: string
  mainAsset: string
  secondaryAsset: string
  title: string
}> = ({ className, mainAsset, secondaryAsset, title, ...restProps }) => {
  return (
    <div className={cn(s.component, className)} {...restProps}>
      <div className={cn(s.assetWrapper)}>
        <div className={cn(s.mainAsset)}>{getAsset(mainAsset)}</div>
        <div className={cn(s.secondaryAsset)}>{getAsset(secondaryAsset)}</div>
      </div>
      <div className={cn(s.title)}>{title}</div>
    </div>
  )
}
