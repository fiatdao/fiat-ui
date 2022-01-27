import s from './s.module.scss'
import cn from 'classnames'

export const CellValue: React.FC<{
  bold?: boolean
  className?: string
  date?: string
  state?: 'danger' | 'ok' | 'warning'
  textAlign?: 'left' | 'right' | 'center'
  tooltip?: string
  value: string
}> = ({ bold, className, date, state, textAlign, tooltip, value, ...restProps }) => {
  return (
    <div className={cn(s.component, className)} title={tooltip} {...restProps}>
      <div
        className={cn(
          s.value,
          { [s.bold]: bold },
          { [s.ok]: state === 'ok' },
          { [s.warning]: state === 'warning' },
          { [s.danger]: state === 'danger' },
          { [s.left]: textAlign === 'left' },
          { [s.center]: textAlign === 'center' },
          { [s.right]: textAlign === 'right' },
        )}
      >
        {value}
      </div>
      {date && <div className={cn(s.date)}>{date}</div>}
    </div>
  )
}
