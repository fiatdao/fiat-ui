import s from './s.module.scss'
import cn from 'classnames'

interface Props {
  className?: string
  footer?: string | React.ReactNode
  title: string
  tooltip?: string
  url?: string
  value: number | string | null | undefined
}

export const InfoBlock: React.FC<Props> = ({
  className,
  footer,
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
          <span className={s.tooltip}>
            <svg fill="none" height="20" width="20">
              <path
                d="M10 1.667c-4.595 0-8.333 3.738-8.333 8.333 0 4.595 3.738 8.333 8.333 8.333 4.595 0 8.333-3.738 8.333-8.333 0-4.595-3.738-8.333-8.333-8.333zm0 15A6.674 6.674 0 013.333 10 6.674 6.674 0 0110 3.333 6.674 6.674 0 0116.667 10 6.674 6.674 0 0110 16.666z"
                fill="#505050"
              />
              <path
                d="M9.167 9.167h1.666v5H9.167v-5zm0-3.333h1.666V7.5H9.167V5.833z"
                fill="#505050"
              />
            </svg>
          </span>
        )}
      </div>
      <p className={s.value}>{value}</p>
      {footer && <div className={s.footer}>{footer}</div>}
    </div>
  )
}
