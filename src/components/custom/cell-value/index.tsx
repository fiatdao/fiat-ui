import s from './s.module.scss'
import cn from 'classnames'

export const CellValue: React.FC<{
  bold?: boolean
  className?: string
  bottomValue?: string
  state?: 'danger' | 'ok' | 'warning'
  textAlign?: 'left' | 'right' | 'center'
  tooltip?: string
  value: string | JSX.Element
}> = ({ bold, bottomValue, className, state, textAlign, tooltip, value, ...restProps }) => {
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
      {bottomValue && <div className={cn(s.bottomValue)}>{bottomValue}</div>}
    </div>
  )
}
