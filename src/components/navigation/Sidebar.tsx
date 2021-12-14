import { NavLink } from './NavLink'
import { ActiveButton } from '../pureStyledComponents/common/Helpers'
import { ReactNode } from 'react'
import styled from 'styled-components'
import { Menu } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { Sidebar as Sider } from '@/src/components/antd'

type MenuItem = {
  icon?: ReactNode
  title: string
  to: string
  key: string
}

export const Sidebar = () => {
  const items: MenuItem[] = [
    {
      to: '/dashboard',
      icon: <UserOutlined />,
      title: 'Dashboard',
      key: 'dashboard',
    },
    {
      to: '/open-position',
      icon: <UserOutlined />,
      title: 'Open position',
      key: 'open-position',
    },
    {
      to: '/your-positions',
      icon: <UserOutlined />,
      title: 'Your Positions',
      key: 'your-positions',
    },
    {
      to: '/liquidations',
      icon: <UserOutlined />,
      title: 'Liquidations',
      key: 'liquidations',
    },
  ]

  return (
    <Sider>
      {items.map((item) => (
        <Menu.Item icon={item.icon} key={item.key}>
          <NavLink href={item.to}>{item.title}</NavLink>
        </Menu.Item>
      ))}
      )
    </Sider>
  )
}
