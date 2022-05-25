import s from './s.module.scss'
import Tooltip from '@/src/components/antd/tooltip'
import Info from '@/src/resources/svg/info.svg'
import ExternalLink from '@/src/components/custom/externalLink'
import InternalArrow from '@/src/resources/svg/interal-arrow.svg'
import { FC, ReactNode } from 'react'
import cn from 'classnames'

interface Props {
  className?: string
  bold?: boolean
  footer?: string | ReactNode
  title: string
  tooltip?: string
  state?: 'danger' | 'ok' | 'warning'
  textAlign?: 'left' | 'right' | 'center'
  url?: string
  value?: string | ReactNode
}

export const InnerInfoBlock: FC<Props> = ({
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
            <InternalArrow />
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

export const InfoBlock: FC<Props> = (props: Props) => {
  const { url } = props
  const isAbsoluteUrl = url && ['https://', 'http://'].some((substring) => url.includes(substring))
  if (!url) {
    return <InnerInfoBlock {...props} />
  }
  if (url && isAbsoluteUrl) {
    return (
      <ExternalLink className={s.link} href={url}>
        <InnerInfoBlock {...props} />
      </ExternalLink>
    )
  }

  return (
    <a className={s.link} href={url}>
      <InnerInfoBlock {...props} />
    </a>
  )
}
