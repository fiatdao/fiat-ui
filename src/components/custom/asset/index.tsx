import s from './s.module.scss'
import { getPTokenIconFromMetadata } from '@/src/constants/bondTokens'
import { AssetIcons } from '@/src/components/custom/asset-icons'
import cn from 'classnames'

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
