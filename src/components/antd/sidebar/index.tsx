import s from './s.module.scss'
import cn from 'classnames'
import { SiderProps } from 'antd/lib/layout'
import React, { useState } from 'react'
import { Button, Layout } from 'antd'
import Chevron from '@/src/components/assets/svg/chevron.svg'
import FiatDaoLogo from '@/src/components/assets/svg/fiat-dao-logo.svg'

const Sidebar: React.FC<SiderProps> = ({ children, className, ...props }) => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Layout.Sider
      {...props}
      breakpoint="lg"
      className={cn(s.sidebar, className)}
      collapsed={collapsed}
      onCollapse={setCollapsed}
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
      {children}
    </Layout.Sider>
  )
}

export default Sidebar
