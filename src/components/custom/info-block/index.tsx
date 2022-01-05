import s from './s.module.scss'
import cn from 'classnames'

interface Props {
  className?: string
  footer?: string | React.ReactNode
  title: string
  value: number | string | null | undefined
}

export const InfoBlock: React.FC<Props> = ({
  className,
  footer,
  title,
  value = '',
  ...restProps
}: Props) => {
  return (
    <div className={cn(s.component, className)} {...restProps}>
      <h1 className={s.title}>{title}</h1>
      <p className={s.value}>{value}</p>
      {footer && <p className={s.footer}>{footer}</p>}
    </div>
  )
}
