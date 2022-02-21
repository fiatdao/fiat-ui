import s from './s.module.scss'
import cn from 'classnames'
import React from 'react'

export const HeaderInfoButton: React.FC<{
  className?: string
  icon: React.ReactNode
  text: string | React.ReactNode
}> = ({ className, icon, text, ...restProps }) => {
  return (
    <div className={cn(s.component, className)} {...restProps}>
      <div className={cn(s.icon)}>{icon}</div>
      <div className={cn(s.text)}>{text}</div>
    </div>
  )
}

export default HeaderInfoButton
