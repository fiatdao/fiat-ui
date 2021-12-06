import { NavLink } from './NavLink'
import { ActiveButton } from '../pureStyledComponents/common/Helpers'
import { useCallback, useState } from 'react'
import styled from 'styled-components'
import Link from 'next/link'

type MenuItem = { icon?: string; title: string; to: string | MenuItem[] }

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

const SidebarWrapper = styled.div`
  grid-area: sidebar;
`
const Nav = styled.nav``
const Item = styled.li``
const Wrapper = styled.ul``
const Icon = styled.div``

const MenuLink = ({ item }: { item: MenuItem }) => {
  const [showSubMenu, setShowSubMenu] = useState(false)
  const { icon, title, to } = item
  const isSubMenu = typeof to === 'object'
  // FIXME Update ts or use guard

  const handleEnterMenu = useCallback(() => {
    if (isSubMenu) {
      setShowSubMenu((showMenu) => !showMenu)
    }
  }, [isSubMenu])

  // TODO isSubMenu => use button
  return (
    <>
      <Item onClick={handleEnterMenu}>
        {icon && <Icon>{icon}</Icon>}
        {typeof to === 'string' ? <NavLink href={to}>{title}</NavLink> : title}
        {isSubMenu && '>'}
      </Item>
      {typeof to !== 'string' && showSubMenu
        ? to.map((i) => <MenuLink item={i} key={i.title} />)
        : null}
    </>
  )
}

export const Sidebar = () => {
  const items: MenuItem[] = [
    {
      to: '/dashboard',
      icon: '😶',
      title: 'Dashboard',
    },
    {
      to: '/deposit',
      icon: '😶',
      title: 'Deposit Collateral',
    },
    {
      to: [
        {
          to: '#',
          icon: '😶',
          title: 'AA',
        },
        {
          to: '#',
          icon: '😶',
          title: 'AB',
        },
      ],
      icon: '😕',
      title: 'Your Account',
    },
  ]
  return (
    <SidebarWrapper>
      <Link href="/" passHref>
        <Logo />
      </Link>
      <Nav>
        <Wrapper>
          {items.map((i) => (
            <MenuLink item={i} key={i.title} />
          ))}
        </Wrapper>
      </Nav>
    </SidebarWrapper>
  )
}
