import s from './s.module.scss'
import cn from 'classnames'
import { Card } from '@/src/components/custom/card'
import { InfoBlock } from '@/src/components/custom/info-block'
import ExternalLink from '@/src/components/custom/externalLink'
import { getEtherscanAddressUrl } from '@/src/web3/utils'

export const PositionFormsLayout: React.FC<{
  className?: string
  form: React.ReactNode
  infoBlocks: any[]
}> = ({ className, form, infoBlocks, ...restProps }) => {
  return (
    <div className={cn(s.component, className)} {...restProps}>
      <div className={cn(s.infoBlocks)}>
        {infoBlocks.map((item, index) => (
          <ExternalLink
            className={!item.address ? s.link : ''}
            href={getEtherscanAddressUrl(item.address, item.appChainId)}
            key={`${index}_info`}
          >
            <InfoBlock
              title={item.title}
              tooltip={item.tooltip || ''}
              url={item.url || ''}
              value={item.value}
            />
          </ExternalLink>
        ))}
      </div>
      <Card noPadding>{form}</Card>
    </div>
  )
}
