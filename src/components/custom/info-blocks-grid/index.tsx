import s from './s.module.scss'
import cn from 'classnames'

interface Props {
  className?: string
  children?: React.ReactNode
}

export const InfoBlocksGrid: React.FC<Props> = ({ children, className, ...restProps }: Props) => {
  return (
    <div className={cn(s.component, className)} {...restProps}>
      {children}
    </div>
  )
}
