import { NavLink } from './NavLink'
import { useRouter } from 'next/router'
import { ReactNode, useEffect, useState } from 'react'
import { Menu } from 'antd'
import DashboardInactive from '@/src/components/assets/svg/dashboard-inactive.svg'
import DashboardActive from '@/src/components/assets/svg/dashboard-active.svg'
import OpenPositionInactive from '@/src/components/assets/svg/open-position-inactive.svg'
import OpenPositionActive from '@/src/components/assets/svg/open-position-active.svg'
import YourPositionsInactive from '@/src/components/assets/svg/your-positions-inactive.svg'
import YourPositionsActive from '@/src/components/assets/svg/your-positions-active.svg'
import LiquidationsInactive from '@/src/components/assets/svg/liquidations-inactive.svg'
import LiquidationsActive from '@/src/components/assets/svg/liquidations-active.svg'
import { Sidebar as Sider } from '@/src/components/antd'

type MenuItem = {
  icon: ReactNode
  iconSelected: ReactNode
  title: string
  to: string
  key: string
}

const items: MenuItem[] = [
  {
    to: '/dashboard',
    icon: <DashboardInactive />,
    iconSelected: <DashboardActive />,
    title: 'Dashboard',
    key: 'dashboard',
  },
  {
    to: '/open-position',
    icon: <OpenPositionInactive />,
    iconSelected: <OpenPositionActive />,
    title: 'Open position',
    key: 'open-position',
  },
  {
    to: '/your-positions',
    icon: <YourPositionsInactive />,
    iconSelected: <YourPositionsActive />,
    title: 'Your Positions',
    key: 'your-positions',
  },
  {
    to: '/liquidations',
    icon: <LiquidationsInactive />,
    iconSelected: <LiquidationsActive />,
    title: 'Liquidations',
    key: 'liquidations',
  },
]

export const Sidebar = () => {
  const { pathname } = useRouter()
  const [selectedItem, setSelectedItem] = useState<MenuItem>()

  useEffect(() => {
    const currentItem = items.find(({ to }) => to === pathname)
    setSelectedItem(currentItem ?? undefined)
  }, [pathname])

  return (
    <Sider>
      <Menu mode="inline" selectedKeys={[selectedItem?.key ?? '']}>
        {items.map((item) => (
          <Menu.Item
            icon={selectedItem?.key === item.key ? item.iconSelected : item.icon}
            key={item.key}
          >
            <NavLink href={item.to}>{item.title}</NavLink>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  )
}
