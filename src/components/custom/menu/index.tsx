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
    const currentItem = routes.find(({ to }) => to === pathname)
    setSelectedItem(currentItem ?? undefined)
  }, [pathname, setSelectedItem])

  return (
    <div className={cn(s.menu, className)} onClick={onClick} {...restProps}>
      {routes.map((item, index) => (
        <Link href={item.to} key={index} passHref>
          <a className={cn(s.item, { [s.isActive]: selectedItem?.key === item.key })}>
            <img
              alt={item.title}
              className={cn(s.icon)}
              src={`data:image/svg+xml;base64,${
                selectedItem?.key === item.key ? item.iconActive : item.icon
              }`}
            />
            <span className={cn(s.title)}>{item.title}</span>
          </a>
        </Link>
      ))}
    </div>
  )
}
