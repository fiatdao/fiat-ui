import s from './s.module.scss'
import cn from 'classnames'
import { Card } from '@/src/components/custom/card'
import { InfoBlock } from '@/src/components/custom/info-block'

export const PositionFormsLayout: React.FC<{
  className?: string
  form: React.ReactNode
  infoBlocks: any[]
}> = ({ className, form, infoBlocks, ...restProps }) => {
  return (
    <div className={cn(s.component, className)} {...restProps}>
      <div className={cn(s.infoBlocks)}>
        {infoBlocks.map((item, index) => (
          <InfoBlock
            key={`${index}_info`}
            title={item.title}
            tooltip={item.tooltip || ''}
            url={item.url || ''}
            value={item.value}
          />
        ))}
      </div>
      <Card noPadding>{form}</Card>
    </div>
  )
}
