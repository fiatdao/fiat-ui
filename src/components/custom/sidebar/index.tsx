import s from './s.module.scss'
import { useState } from 'react'
import { Button } from 'antd'
import cn from 'classnames'
import { SiderProps } from 'antd/lib/layout'
import { Layout } from 'antd'
import { SideMenuFooter } from '@/src/components/custom/side-menu-footer'
import Chevron from '@/src/resources/svg/chevron.svg'
import { Logo } from '@/src/components/custom/logo'
import { Menu } from '@/src/components/custom/menu'

export const Sidebar: React.FC<SiderProps> = ({ className, ...restProps }) => {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Layout.Sider
      breakpoint="xl"
      className={cn(s.sidebar, className)}
      collapsed={collapsed}
      onCollapse={() => setCollapsed(true)}
      width={256}
      {...restProps}
    >
      <div className={cn(s.topWrapper)}>
        <Logo className={cn(s.logo)} />
        <Button
          className={cn(s.sidebarCollapseButton)}
          icon={<Chevron className={cn(s.chevron, { [s.collapsed]: collapsed })} />}
          onClick={() => setCollapsed((prev) => !prev)}
        />
      </div>
      <Menu />
      {!collapsed && <SideMenuFooter className={cn(s.sideMenuFooter)} />}
    </Layout.Sider>
  )
}
