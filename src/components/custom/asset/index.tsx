import s from './s.module.scss'
import cn from 'classnames'

import { AssetIcons } from '@/src/components/custom/asset-icons'

export const Asset: React.FC<{
  className?: string
  mainAsset: string
  secondaryAsset: string
  title: string
}> = ({ className, mainAsset, secondaryAsset, title, ...restProps }) => {
  return (
    <div className={cn(s.component, className)} {...restProps}>
      <AssetIcons dimensions="32px" mainAsset={mainAsset} secondaryAsset={secondaryAsset} />
      <div className={cn(s.title)}>{title}</div>
    </div>
  )
}
