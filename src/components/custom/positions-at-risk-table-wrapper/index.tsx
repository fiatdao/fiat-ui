import s from './s.module.scss'
import cn from 'classnames'

export const PositionsAtRiskTableWrapper: React.FC<{
  className?: string
  children: React.ReactNode
  title?: string
}> = ({ children, className, title = 'Positions at risk', ...restProps }) => {
  return (
    <div className={cn(s.component, className)} {...restProps}>
      <div className={cn(s.top)}>
        <svg
          fill="none"
          height="20"
          viewBox="0 0 20 20"
          width="20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9.99984 1.66663C5.40484 1.66663 1.6665 5.40496 1.6665 9.99996C1.6665 14.595 5.40484 18.3333 9.99984 18.3333C14.5948 18.3333 18.3332 14.595 18.3332 9.99996C18.3332 5.40496 14.5948 1.66663 9.99984 1.66663ZM9.99984 16.6666C6.324 16.6666 3.33317 13.6758 3.33317 9.99996C3.33317 6.32413 6.324 3.33329 9.99984 3.33329C13.6757 3.33329 16.6665 6.32413 16.6665 9.99996C16.6665 13.6758 13.6757 16.6666 9.99984 16.6666Z"
            fill="white"
          />
          <path
            d="M10.8335 10.8333L9.16683 10.8333L9.16683 5.83329L10.8335 5.83329L10.8335 10.8333ZM10.8335 14.1666L9.16683 14.1666L9.16683 12.5L10.8335 12.5L10.8335 14.1666Z"
            fill="white"
          />
        </svg>
        <h2 className={cn(s.title)}>{title}</h2>
      </div>
      <div className={cn(s.content)}>{children}</div>
    </div>
  )
}
