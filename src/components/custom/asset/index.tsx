import s from './s.module.scss'
import cn from 'classnames'

import { AssetIcons } from '@/src/components/custom/asset-icons'
import { getPTokenIconFromMetadata } from '@/src/constants/bondTokens'

export const Asset: React.FC<{
  className?: string
  mainAsset: string
  title: string
  url?: string
}> = ({ className, mainAsset, title, url, ...restProps }) => {
  return (
    <div className={cn(s.component, className)} {...restProps}>
      <AssetIcons
        className={cn(s.icon)}
        dimensions="30px"
        mainAsset={getPTokenIconFromMetadata(mainAsset)?.main}
        secondaryAsset={getPTokenIconFromMetadata(mainAsset)?.secondary}
      />

      {url ? (
        <a href={url} rel="no-referrer noreferrer" target="_blank">
          <div className={cn(s.title)}>{title}</div>
        </a>
      ) : (
        <div className={cn(s.title)}>{title}</div>
      )}
    </div>
  )
}
