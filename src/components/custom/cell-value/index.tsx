import s from './s.module.scss'
import cn from 'classnames'

export const CellValue: React.FC<{
  bold?: boolean
  date?: string
  state?: 'error' | 'ok' | 'warning'
  textAlign?: 'left' | 'right' | 'center'
  value: string
}> = ({ bold, date, state, textAlign, value, ...restProps }) => {
  return (
    <div className={cn(s.component)} {...restProps}>
      <div className={cn(s.value, { [s.bold]: bold })}>{value}</div>
      {date && <div className={cn(s.date)}>{date}</div>}
    </div>
  )
}
