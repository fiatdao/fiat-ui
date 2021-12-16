import s from './s.module.scss'
import React from 'react'
import AntdDivider, { DividerProps as AntdDividerProps } from 'antd/lib/divider'
import cn from 'classnames'

const Divider: React.FC<AntdDividerProps> = (props) => {
  const { className, ...dividerProps } = props

  return <AntdDivider className={cn(s.divider, className)} {...dividerProps} />
}

export default Divider
