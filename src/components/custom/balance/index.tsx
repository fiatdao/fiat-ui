import s from './s.module.scss'
import cn from 'classnames'

type Props = {
  title: string
  description?: string | null
  value: string
  className?: string
}

export const Balance: React.FC<Props> = ({
  className,
  description,
  title,
  value,
  ...restProps
}) => (
  <div className={cn(s.component, className)} {...restProps}>
    <div className={cn(s.titleAndDescriptionContainer)}>
      <h3 className={cn(s.label)}>{title}</h3>
      {description && <p className={cn(s.label)}>{description}</p>}
    </div>
    <p className={cn(s.balance)}>{value}</p>
  </div>
)
