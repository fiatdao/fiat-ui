/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import s from './s.module.scss'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import cn from 'classnames'
import { RouteItem, routes } from '@/src/constants/navigation'

interface Props {
  className?: string
  onClick?: () => void
}

export const Menu: React.FC<Props> = ({ className, onClick, ...restProps }: Props) => {
  const { pathname } = useRouter()
  const [selectedItem, setSelectedItem] = useState<RouteItem>()

  useEffect(() => {
    const currentItem = [...routes].reverse().find(({ to }) => pathname.startsWith(to))
    setSelectedItem(currentItem ?? undefined)
  }, [pathname, setSelectedItem])

  const userPositions = 4

  return (
    <div className={cn(s.menu, className)} onClick={onClick} {...restProps}>
      {routes.map(({ badge, icon, iconActive, key, title, to }, index) => (
        <Link href={to} key={`${index}_${key}`} passHref>
          <a className={cn(s.item, { [s.isActive]: selectedItem?.key === key })}>
            <img
              alt={title}
              className={cn(s.icon)}
              src={`data:image/svg+xml;base64,${selectedItem?.key === key ? iconActive : icon}`}
            />
            <span className={cn(s.title)}>{title}</span>
            {badge && (
              <span className={cn(s.badge)}>
                <span className={cn(s.badgeInner)}>
                  <span className={cn(s.badgeBackground)}>{userPositions}</span>
                </span>
              </span>
            )}
          </a>
        </Link>
      ))}
    </div>
  )
}
