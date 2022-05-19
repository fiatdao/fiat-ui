import s from './s.module.scss'
import cn from 'classnames'

export const CellValue: React.FC<{
  bold?: boolean
  className?: string
  bottomValue?: string
  state?: 'danger' | 'ok' | 'warning'
  textAlign?: 'left' | 'right' | 'center'
  tooltip?: string
  url?: string
  value: string | JSX.Element
}> = ({ bold, bottomValue, className, state, textAlign, tooltip, url, value, ...restProps }) => {
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
        {url ? (
          <a className={cn(s.link)} href={url} rel="no-referrer noreferrer" target="_blank">
            {value}
          </a>
        ) : (
          value
        )}
      </div>
      {bottomValue && <div className={cn(s.bottomValue)}>{bottomValue}</div>}
    </div>
  )
}
