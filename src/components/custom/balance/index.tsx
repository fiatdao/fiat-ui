import s from './s.module.scss'
import cn from 'classnames'

type Props = {
  title: string
  value: string
  className?: string
}

export const Balance: React.FC<Props> = ({ className, title, value, ...restProps }) => (
  <div className={cn(s.component, className)} {...restProps}>
    <h3 className={cn(s.label)}>{title}</h3>
    <p className={cn(s.balance)}>{value}</p>
  </div>
)
