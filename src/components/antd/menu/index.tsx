import s from './s.module.scss'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import cn from 'classnames'
import { SiderProps } from 'antd/lib/layout'
import { RouteItem, routes } from '@/src/constants/navigation'

export const Menu: React.FC<SiderProps> = ({ className }) => {
  const { pathname } = useRouter()
  const [selectedItem, setSelectedItem] = useState<RouteItem>()

  useEffect(() => {
    const currentItem = routes.find(({ to }) => to === pathname)
    setSelectedItem(currentItem ?? undefined)
  }, [pathname])

  return (
    <div className={cn(s.menu, className)}>
      {routes.map((item, index) => (
        <Link href={item.to} key={index} passHref>
          <a className={cn(s.item, { [s.isActive]: selectedItem?.key === item.key })}>
            <span className={cn(s.icon)}>
              {selectedItem?.key === item.key ? item.iconActive : item.icon}
            </span>
            <span className={cn(s.title)}>{item.title}</span>
          </a>
        </Link>
      ))}
    </div>
  )
}
