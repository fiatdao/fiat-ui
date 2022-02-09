import s from './s.module.scss'
import cn from 'classnames'

export const Card: React.FC<{
  className?: string
  noPadding?: boolean
}> = ({ children, className, noPadding, ...restProps }) => {
  return (
    <div className={cn(s.component, { [s.noPadding]: noPadding }, className)} {...restProps}>
      {children}
    </div>
  )
}
