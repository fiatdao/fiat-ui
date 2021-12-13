import { NavLink } from './NavLink'
import { ActiveButton } from '../pureStyledComponents/common/Helpers'
import { ReactNode } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import Image from 'next/image'
import { Layout, Menu } from 'antd'
import SubMenu from 'antd/lib/menu/SubMenu'
import { LaptopOutlined, NotificationOutlined, UserOutlined } from '@ant-design/icons'

type MenuItem = { icon?: ReactNode; title: string; to: string | { to: string; title: string }[] }

const Logo = styled.div`
  background-image: url('images/logo.svg');
  background-repeat: no-repeat;
  background-size: contain;
  cursor: pointer;
  flex-shrink: 0;
  height: 40px;
  text-decoration: none;
  user-select: none;
  width: auto;
  margin-left: 20px;
  margin-top: 24px;

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletLandscapeStart}) {
    margin-bottom: -10px;
  }

  ${ActiveButton}
`

export const Sidebar = () => {
  const items: MenuItem[] = [
    {
      to: '/dashboard',
      icon: <UserOutlined />,
      title: 'Dashboard',
    },
    {
      to: '/deposit',
      icon: <UserOutlined />,
      title: 'Open position',
    },
    {
      to: [
        {
          to: '#',
          title: 'submenu1',
        },
        {
          to: '/dashboard',
          title: 'submenu2',
        },
      ],
      icon: <UserOutlined />,
      title: 'Your Account',
    },
  ]
  return (
    <Layout.Sider>
      <Link href="/" passHref>
        <Logo />
      </Link>
      <Menu
        defaultOpenKeys={['sub1']}
        defaultSelectedKeys={['1']}
        mode="inline"
        style={{ paddingTop: '30px', height: '100%', background: 'transparent' }}
      >
        {items.map((item, index) => {
          return Array.isArray(item.to) ? (
            <SubMenu icon={<UserOutlined />} key={index} title={item.title}>
              {item.to.map((subitem) => {
                return <Menu.Item key={subitem.title}>{subitem.title}</Menu.Item>
              })}
            </SubMenu>
          ) : (
            <Menu.Item>
              <NavLink href={item.to}>{item.title}</NavLink>
            </Menu.Item>
          )
        })}
        )
      </Menu>
    </Layout.Sider>
  )
}
