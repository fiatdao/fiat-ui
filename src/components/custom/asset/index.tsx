import s from './s.module.scss'

import { AssetIcons } from '@/src/components/custom/asset-icons'
import { getPTokenIconFromMetadata } from '@/src/constants/bondTokens'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import cn from 'classnames'

export const Asset: React.FC<{
  className?: string
  mainAsset: string
  title: string
}> = ({ className, mainAsset, title, ...restProps }) => {
  const { appChainId } = useWeb3Connection()

  return (
    <div className={cn(s.component, className)} {...restProps}>
      <AssetIcons
        className={cn(s.icon)}
        dimensions="30px"
        mainAsset={getPTokenIconFromMetadata(appChainId, mainAsset)?.protocol}
        secondaryAsset={getPTokenIconFromMetadata(appChainId, mainAsset)?.asset}
      />
      <div className={cn(s.title)}>{title}</div>
    </div>
  )
}
