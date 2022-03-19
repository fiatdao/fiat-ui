import s from './s.module.scss'
import cn from 'classnames'
import Tooltip from '@/src/components/antd/tooltip'
import Info from '@/src/resources/svg/info.svg'

interface Props {
  className?: string
  bold?: boolean
  footer?: string | React.ReactNode
  title: string
  tooltip?: string
  state?: 'danger' | 'ok' | 'warning'
  textAlign?: 'left' | 'right' | 'center'
  url?: string
  value?: string | React.ReactNode
}

export const InfoBlock: React.FC<Props> = ({
  bold,
  className,
  footer,
  state,
  textAlign,
  title,
  tooltip,
  url,
  value = '',
  ...restProps
}: Props) => {
  return (
    <div className={cn(s.component, className)} {...restProps}>
      <div className={s.titleWrapper}>
        <h1 className={s.title}>{title}</h1>
        {url && (
          <a className={s.link} href={url} rel="noreferrer" target="_blank">
            <svg fill="none" height="10" width="10" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M.902 9.052a.75.75 0 010-1.06L6.694 2.2H2.847a.75.75 0 010-1.499h5.657a.75.75 0 01.75.75v5.657a.75.75 0 11-1.5 0V3.26l-5.79 5.791a.75.75 0 01-1.062 0z"
                fill="#fff"
              />
            </svg>
          </a>
        )}
        {tooltip && (
          <Tooltip title={tooltip}>
            <Info />
          </Tooltip>
        )}
      </div>
      <p
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
      </p>
      {footer && <div className={s.footer}>{footer}</div>}
    </div>
  )
}
