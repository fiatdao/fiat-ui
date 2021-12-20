import s from './s.module.scss'
import React, { CSSProperties, FC, ReactNode } from 'react'
import cn from 'classnames'
import Link from 'next/link'
import NavLink, { NavLinkProps } from '@/src/components/custom/nav-link'

type NavTabProps = NavLinkProps /* | HTMLProps<HTMLAnchorElement>*/

type NavTabsProps = {
  tabs: NavTabProps[]
  className?: string
  /**
   * @example
   * <Tabs shadows="--theme-card-color" /> in case of string, place background color variable,
   * <Tabs shadows /> `--theme-body-color` will be used in case of `true`
   */
  shadows?: boolean | string
}

export const NavTabs: FC<NavTabsProps> = ({ className, shadows = false, tabs }) => {
  return (
    <div
      className={cn(s.tabs, className, {
        [s.shadows]: shadows,
      })}
      style={
        {
          '--tabs-bg': `var(${typeof shadows === 'string' ? shadows : '--theme-body-color'})`,
        } as CSSProperties
      }
    >
      {tabs.map(({ children, className, ...restTab }, idx) => {
        // @ts-ignore
        if (restTab.to) {
          return (
            // @ts-ignore
            <NavLink
              activeClassName={s.active}
              className={cn(s.tab, className)}
              key={idx}
              {...restTab}
            >
              {children}
            </NavLink>
          )
        }

        return (
          <Link key="a-link" {...restTab}>
            <a className={cn(s.tab, className)} key={idx} rel="noopener noreferrer" target="_blank">
              {children}
            </a>
          </Link>
        )
      })}
    </div>
  )
}

type TabProps = {
  id: string
  children: ReactNode
  className?: string
  disabled?: boolean
  // eslint-disable-next-line @typescript-eslint/ban-types
  onClick?: Function
}

type TabsProps = {
  variation?: 'normal' | 'elastic'
  tabs: TabProps[]
  activeKey: TabProps['id']
  size?: 'normal' | 'small'
  className?: string
  style?: CSSProperties
  onClick?: (id: TabProps['id']) => void
}

export const Tabs: FC<TabsProps> = (props) => {
  const { activeKey, className, size, style, tabs, variation = 'normal' } = props

  const totalTabs = tabs.length
  const activeIndex = tabs.findIndex((tab) => tab.id === activeKey)

  return (
    <div
      className={cn(className, {
        [s.tabs]: variation === 'normal',
        [s.elasticTabs]: variation === 'elastic',
      })}
      style={style}
    >
      {variation === 'elastic' && (
        <div
          className={s.elasticToggle}
          style={{
            left: `calc(${activeIndex} * 100% / ${totalTabs} + 4px)`,
            width: `calc(100% / ${totalTabs} - 8px)`,
          }}
        />
      )}
      {tabs.map(({ className, id, onClick, ...tabRest }) => (
        <button
          className={cn(s.tab, className, {
            [s.active]: id === activeKey,
            [s.small]: size === 'small',
          })}
          key={id}
          onClick={() => {
            props.onClick?.(id)
            onClick?.()
          }}
          style={{ width: variation === 'elastic' ? `calc(100% / ${totalTabs})` : 'inherit' }}
          type="button"
          {...tabRest}
        />
      ))}
    </div>
  )
}
