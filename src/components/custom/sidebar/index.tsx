import s from './s.module.scss'
import { useRouter } from 'next/router'
import { ReactNode, useEffect, useState } from 'react'
import { Button, Divider, Menu } from 'antd'
import cn from 'classnames'
import { SiderProps } from 'antd/lib/layout'
import { Layout } from 'antd'
import { routes } from '@/src/constants/navigation'
import { NavLink } from '@/src/components/to-be-deprecated/NavLink'
import FiatDaoLogo from '@/src/resources/svg/fiat-dao-logo.svg'
import FiatDaoIcon from '@/src/resources/svg/fiat-dao-icon.svg'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import Chevron from '@/src/resources/svg/chevron.svg'

type MenuItem = {
  icon: ReactNode
  iconSelected: ReactNode
  key: string
  title: string
  to: string
}

export const Sidebar: React.FC<SiderProps> = ({ className, ...props }) => {
  const { pathname } = useRouter()
  const [selectedItem, setSelectedItem] = useState<MenuItem>()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const currentItem = routes.find(({ to }) => to === pathname)
    setSelectedItem(currentItem ?? undefined)
  }, [pathname])

  const handleAddProjectToken = () => {
    // TODO: add project token
  }

  return (
    <Layout.Sider
      breakpoint="lg"
      className={cn(s.sidebar, className)}
      collapsed={collapsed}
      onCollapse={setCollapsed}
      width={256}
      {...props}
    >
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
        {routes.map((item) => (
          <Menu.Item
            icon={selectedItem?.key === item.key ? item.iconSelected : item.icon}
            key={item.key}
          >
            <NavLink href={item.to}>{item.title}</NavLink>
          </Menu.Item>
        ))}
      </Menu>
      {!collapsed && (
        <div className="side-menu-footer">
          <div className="links">
            <p>
              <a href="https://google.com" title="Buy and sell on Matcha">
                Buy and sell on Matcha <span>icon</span>
              </a>
            </p>
            <p>
              <a href="https://google.com" title="Borrow and lend on Rari Fuse">
                Borrow and lend on Rari Fuse <span>icon</span>
              </a>
            </p>
            <p>
              <a href="https://google.com" title="FIAT's Dune Dashboard">
                FIAT's Dune Dashboard <span>icon</span>
              </a>
            </p>
          </div>
          <Divider />
          <div className="add-to-wallet">
            <p>ADD TO WALLET</p>
            <div className="buttons-container">
              <div>
                <Button onClick={handleAddProjectToken} type="primary">
                  <FiatIcon /> FIAT
                </Button>
              </div>
              <div>
                <Button onClick={handleAddProjectToken} type="primary">
                  <FiatDaoIcon /> FDT
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout.Sider>
  )
}
