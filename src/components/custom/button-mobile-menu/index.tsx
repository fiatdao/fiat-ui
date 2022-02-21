import s from './s.module.scss'
import cn from 'classnames'

export const ButtonMobileMenu: React.FC<{
  className?: string
  onClick: () => void
  drawerVisible: boolean
}> = ({ className, drawerVisible, onClick, ...restProps }) => {
  return (
    <button className={cn(s.component, className)} onClick={onClick} {...restProps}>
      <span className={cn(s.burguerMenuButton, { [s.isDrawerVisible]: drawerVisible })}>
        <span className={cn(s.line, s.line1)}></span>
        <span className={cn(s.line, s.line2)}></span>
      </span>
    </button>
  )
}
