import s from './s.module.scss'
import React from 'react'
import { Popover as BasePopover, PopoverProps } from 'antd'
import cn from 'classnames'

export const Popover: React.FC<PopoverProps> = (props) => {
  const { children, className, ...popoverProps } = props

  return (
    <BasePopover overlayClassName={cn(s.component, className)} {...popoverProps}>
      {children}
    </BasePopover>
  )
}

export default Popover
