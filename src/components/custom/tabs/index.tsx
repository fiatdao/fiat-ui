import s from './s.module.scss'
import cn from 'classnames'

export const Tab: React.FC<{
  className?: string
  children?: React.ReactNode
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
}> = ({ children, className, disabled, isActive, onClick, ...restProps }) => {
  return (
    <button
      className={cn(s.tab, className, {
        [s.active]: isActive,
      })}
      disabled={disabled}
      onClick={onClick}
      {...restProps}
    >
      {children}
    </button>
  )
}

export const Tabs: React.FC<{
  className?: string
  children?: React.ReactNode
}> = ({ children, className, ...restProps }) => {
  return (
    <div className={cn(s.tabs, className)} {...restProps}>
      {children}
    </div>
  )
}
