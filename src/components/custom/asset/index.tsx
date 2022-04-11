import s from './s.module.scss'
import cn from 'classnames'

import { AssetIcons } from '@/src/components/custom/asset-icons'
import { getPTokenIconFromMetadata } from '@/src/constants/bondTokens'

export const Asset: React.FC<{
  className?: string
  mainAsset: string
  title: string
}> = ({ className, mainAsset, title, ...restProps }) => {
  return (
    <div className={cn(s.component, className)} {...restProps}>
      <AssetIcons
        className={cn(s.icon)}
        dimensions="32px"
        mainAsset={getPTokenIconFromMetadata(mainAsset)?.main}
        secondaryAsset={getPTokenIconFromMetadata(mainAsset)?.secondary}
      />
      <div className={cn(s.title)}>{title}</div>
    </div>
  )
}
