import s from './s.module.scss'
import cn from 'classnames'
import { SiderProps } from 'antd/lib/layout'
import React, { useState } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { Layout, Menu } from 'antd'

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
`

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
      <Link href="/" passHref>
        <Logo />
      </Link>
      <button onClick={() => setCollapsed((prev) => !prev)}>{collapsed ? '>' : '<'}</button>
      <Menu defaultSelectedKeys={['1']} mode="inline">
        {children}
      </Menu>
    </Layout.Sider>
  )
}

export default Sidebar
