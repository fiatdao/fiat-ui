import s from './s.module.scss'
import React from 'react'
import cn from 'classnames'

export const RadioTab: React.FC<{
  checked: boolean
  className?: string
  disabled?: boolean
  onClick: () => void
}> = ({ checked, children, className, disabled, onClick, ...restProps }) => {
  return (
    <button
      className={cn(s.component, { [s.checked]: checked }, className)}
      disabled={disabled}
      onClick={onClick}
      {...restProps}
    >
      {children}
    </button>
  )
}

export const RadioTabsWrapper: React.FC<{
  className?: string
}> = ({ children, className, ...restProps }) => {
  return (
    <div className={cn(s.radioTabsWrapper, className)} {...restProps}>
      <div className={cn(s.radioTabsInner)}>{children}</div>
    </div>
  )
}
