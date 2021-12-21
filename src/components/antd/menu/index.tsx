import s from './s.module.scss'
import { useRouter } from 'next/router'
import { ReactNode, useEffect, useState } from 'react'
import { Menu as AntdMenu } from 'antd'
import cn from 'classnames'
import { SiderProps } from 'antd/lib/layout'
import { routes } from '@/src/constants/navigation'
import { NavLink } from '@/src/components/to-be-deprecated/NavLink'

type MenuItem = {
  icon: ReactNode
  iconSelected: ReactNode
  key: string
  title: string
  to: string
}

export const Menu: React.FC<SiderProps> = ({ className }) => {
  const { pathname } = useRouter()
  const [selectedItem, setSelectedItem] = useState<MenuItem>()

  useEffect(() => {
    const currentItem = routes.find(({ to }) => to === pathname)
    setSelectedItem(currentItem ?? undefined)
  }, [pathname])

  return (
    <AntdMenu
      className={cn(s.menu, className)}
      mode="inline"
      selectedKeys={[selectedItem?.key ?? '']}
    >
      {routes.map((item) => (
        <AntdMenu.Item
          icon={selectedItem?.key === item.key ? item.iconSelected : item.icon}
          key={item.key}
        >
          <NavLink href={item.to}>{item.title}</NavLink>
        </AntdMenu.Item>
      ))}
    </AntdMenu>
  )
}
