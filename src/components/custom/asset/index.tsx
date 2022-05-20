import s from './s.module.scss'
import cn from 'classnames'

import { AssetIcons } from '@/src/components/custom/asset-icons'
import { getPTokenIconFromMetadata } from '@/src/constants/bondTokens'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

export const Asset: React.FC<{
  className?: string
  mainAsset: string
  title: string
  url?: string
}> = ({ className, mainAsset, title, url, ...restProps }) => {
  const { appChainId } = useWeb3Connection()

  return (
    <div className={cn(s.component, className)} {...restProps}>
      <AssetIcons
        className={cn(s.icon)}
        dimensions="30px"
        mainAsset={getPTokenIconFromMetadata(appChainId, mainAsset)?.main}
        secondaryAsset={getPTokenIconFromMetadata(appChainId, mainAsset)?.secondary}
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
