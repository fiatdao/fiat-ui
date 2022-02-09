import s from './s.module.scss'
import cn from 'classnames'
import { Card } from '@/src/components/custom/card'

export const PositionFormsLayout: React.FC<{
  className?: string
  form: React.ReactNode
  infoBlocks: React.ReactNode
}> = ({ className, form, infoBlocks, ...restProps }) => {
  return (
    <div className={cn(s.component, className)} {...restProps}>
      <div className={cn(s.infoBlocks)}>{infoBlocks}</div>
      <Card noPadding>{form}</Card>
    </div>
  )
}
