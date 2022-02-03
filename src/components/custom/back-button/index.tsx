import s from './s.module.scss'
import cn from 'classnames'
import Link from 'next/link'

export const BackButton: React.FC<{ className?: string; href: string }> = ({
  children,
  className,
  href,
  ...restProps
}) => {
  if (!children) return null

  return (
    <Link href={href} passHref {...restProps}>
      <a className={cn(s.component, className)}>
        <svg
          fill="none"
          height="14"
          viewBox="0 0 16 14"
          width="16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            className={cn(s.fill)}
            d="M7.53042 1.53033C7.82332 1.23744 7.82332 0.762563 7.53042 0.46967C7.23753 0.176777 6.76266 0.176777 6.46976 0.46967L7.53042 1.53033ZM1.7072 6.29289L2.23753 6.82322H2.23753L1.7072 6.29289ZM1.7072 7.70711L2.23753 7.17678H2.23753L1.7072 7.70711ZM6.46976 13.5303C6.76266 13.8232 7.23753 13.8232 7.53042 13.5303C7.82332 13.2374 7.82332 12.7626 7.53042 12.4697L6.46976 13.5303ZM2.00009 6.25C1.58588 6.25 1.25009 6.58579 1.25009 7C1.25009 7.41421 1.58588 7.75 2.00009 7.75L2.00009 6.25ZM15.0001 7.75C15.4143 7.75 15.7501 7.41421 15.7501 7C15.7501 6.58579 15.4143 6.25 15.0001 6.25V7.75ZM6.46976 0.46967L1.17687 5.76256L2.23753 6.82322L7.53042 1.53033L6.46976 0.46967ZM1.17687 8.23744L6.46976 13.5303L7.53042 12.4697L2.23753 7.17678L1.17687 8.23744ZM1.17687 5.76256C0.493452 6.44598 0.493452 7.55402 1.17687 8.23744L2.23753 7.17678C2.1399 7.07915 2.1399 6.92085 2.23753 6.82322L1.17687 5.76256ZM2.00009 7.75L15.0001 7.75V6.25L2.00009 6.25L2.00009 7.75Z"
          />
        </svg>
        {children}
      </a>
    </Link>
  )
}
