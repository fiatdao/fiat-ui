import { NavLink } from './NavLink'
import { ReactNode, useState } from 'react'
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

export const Sidebar = () => {
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

  const [selectedItem, setSelectedItem] = useState(items[0].key)

  return (
    <Sider>
      <Menu
        defaultSelectedKeys={['1']}
        mode="inline"
        onSelect={(options) => {
          console.log({ options })
          setSelectedItem(options.key)
        }}
      >
        {items.map((item) => (
          <Menu.Item
            icon={selectedItem === item.key ? item.iconSelected : item.icon}
            key={item.key}
          >
            <NavLink href={item.to}>{item.title}</NavLink>
          </Menu.Item>
        ))}
      </Menu>
    </Sider>
  )
}
