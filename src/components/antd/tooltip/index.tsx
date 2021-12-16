import s from './s.module.scss'
import React from 'react'
import AntdTooltip, { TooltipPropsWithTitle as AntdTooltipPropsWithTitle } from 'antd/lib/tooltip'
import cn from 'classnames'

export type TooltipProps = Partial<AntdTooltipPropsWithTitle> & {
  hint?: boolean
}

const Tooltip: React.FC<TooltipProps> = (props) => {
  const { children, hint, overlayClassName, ...tooltipProps } = props

  return (
    <AntdTooltip
      overlayClassName={cn(s.overlay, overlayClassName, { [s.hint]: hint })}
      placement="bottom"
      title=""
      {...tooltipProps}
    >
      {children}
    </AntdTooltip>
  )
}

export default Tooltip
