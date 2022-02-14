import s from './s.module.scss'
import cn from 'classnames'

export const ButtonsWrapper: React.FC<{ className?: string }> = ({
  children,
  className,
  ...restProps
}) => {
  return (
    <div className={cn(s.component, className)} {...restProps}>
      {children}
    </div>
  )
}
