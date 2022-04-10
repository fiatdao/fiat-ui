import s from './s.module.scss'
import Less from '@/src/resources/svg/gradient-less.svg'
import cn from 'classnames'

type Props = {
  bottom: React.ReactNode
  buttonText: string
  className?: string
  top: React.ReactNode
  onClick: () => void
}

export const FormExtraAction: React.FC<Props> = ({
  bottom,
  buttonText,
  className,
  onClick,
  top,
  ...restProps
}) => {
  return (
    <div className={cn(s.component, className)} {...restProps}>
      <button className={cn(s.button)} onClick={onClick}>
        <span className={cn(s.buttonInner)}>
          <Less />
          <span>{buttonText}</span>
        </span>
      </button>
      <div className={cn(s.contents)}>
        <div className={cn(s.contentsInner)}>
          {top}
          {bottom}
        </div>
      </div>
    </div>
  )
}
