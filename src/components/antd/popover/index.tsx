import s from './s.module.scss'
import React from 'react'
import AntdPopover, { PopoverProps as AntdPopoverProps } from 'antd/lib/popover'
import cn from 'classnames'

export type PopoverProps = {
  noPadding?: boolean
}

const Popover: React.FC<AntdPopoverProps & PopoverProps> = (props) => {
  const { children, className, noPadding, ...popoverProps } = props

  return (
    <AntdPopover
      overlayClassName={cn(s.overlay, className, noPadding && s.noPadding)}
      placement="bottom"
      trigger="click"
      {...popoverProps}
    >
      {children}
    </AntdPopover>
  )
}

export default Popover
