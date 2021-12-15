import s from './s.module.scss'
import cn from 'classnames'
import { SiderProps } from 'antd/lib/layout'
import React from 'react'
import { Layout } from 'antd'

const Sidebar: React.FC<SiderProps> = ({ children, className, ...props }) => {
  return (
    <Layout.Sider {...props} breakpoint="lg" className={cn(s.sidebar, className)} width={256}>
      {children}
    </Layout.Sider>
  )
}

export default Sidebar
