import s from './s.module.scss'
import Link from 'next/link'
import cn from 'classnames'

type Props = {
  className?: string
}

export const Logo: React.FC<Props> = ({ className, ...restProps }: Props) => {
  return (
    <Link href="/" passHref>
      <a className={cn(className, s.logoWrapper)} {...restProps}>
        <span className={cn(s.logo)} />
      </a>
    </Link>
  )
}
