import { NavLink } from './NavLink'
import cn from 'classnames'
import { useRouter } from 'next/router'
import React, { ReactNode, useEffect, useState } from 'react'
import { Button, Menu } from 'antd'
import { ExternalLink as ExternalLinkIcon } from '@/src/components/pureStyledComponents/text/Link'
import { ExternalLink } from '@/src/components/custom'
import FiatDaoLogo from '@/src/components/assets/svg/fiat-dao-logo.svg'
import Chevron from '@/src/components/assets/svg/chevron.svg'
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
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const currentItem = items.find(({ to }) => to === pathname)
    setSelectedItem(currentItem ?? undefined)
  }, [pathname])

  return (
    <Sider collapsed={collapsed} onCollapse={setCollapsed}>
      <div className="logo-wrapper">
        <div className="logo">
          <FiatDaoLogo />
          {!collapsed && <p className="app-name">App</p>}
        </div>
        <div>
          <Button
            icon={<Chevron className={cn('chevron', { collapsed })} />}
            onClick={() => setCollapsed((prev) => !prev)}
            type="primary"
          />
        </div>
      </div>
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
      {!collapsed && (
        <div className="ant-layout-sider-trigger">
          <div>
            <p>
              <ExternalLink href="https://google.com" title="Buy and sell on Matcha">
                Buy and sell on Matcha <ExternalLinkIcon />
              </ExternalLink>
            </p>
            <p>
              <ExternalLink href="https://google.com" title="Borrow and lend on Rari Fuse">
                Borrow and lend on Rari Fuse <ExternalLinkIcon />
              </ExternalLink>
            </p>
            <p>
              <ExternalLink href="https://google.com" title="FIAT's Dune Dashboard">
                FIAT's Dune Dashboard <ExternalLinkIcon />
              </ExternalLink>
            </p>
          </div>
          <div>
            <p>ADD TO WALLET</p>
            <div style={{ display: 'flex', justifyContent: 'space-evenly', alignItems: 'center' }}>
              <div>
                <Button type="ghost">FIAT</Button>
              </div>
              <div>
                <Button type="ghost">FDT</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Sider>
  )
}
