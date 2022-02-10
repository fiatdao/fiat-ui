import s from './s.module.scss'
import cn from 'classnames'

export const SummaryItem: React.FC<{
  state?: 'ok' | 'warning' | 'danger' | undefined
  title: string
  value: string
}> = ({ state, title, value }) => (
  <div className={s.row}>
    <div className={s.title}>{title}</div>
    <div
      className={cn(
        s.value,
        { [s.ok]: state === 'ok' },
        { [s.warning]: state === 'warning' },
        { [s.danger]: state === 'danger' },
      )}
    >
      {value}
    </div>
  </div>
)

interface Props {
  className?: string
  data: any[]
}

export const Summary: React.FC<Props> = ({ className, data, ...restProps }) => {
  return (
    <div className={cn(s.component, className)} {...restProps}>
      {data.map((item, index) => (
        <SummaryItem key={index} {...item} />
      ))}
    </div>
  )
}
