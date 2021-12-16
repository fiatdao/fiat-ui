import s from './s.module.scss'
import React from 'react'
import cn from 'classnames'

export type WrapperContent = {
  className?: string
}

export const WrapperContent: React.FC<WrapperContent> = (props) => {
  const { children, className } = props

  return <div className={cn(s.wrapperContent, className)}>{children}</div>
}
