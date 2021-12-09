import { NavLink } from './NavLink'
import { ActiveButton, Text } from '../pureStyledComponents/common/Helpers'
import { ReactNode, useState } from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import Image from 'next/image'

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

const SidebarWrapper = styled.div`
  grid-area: sidebar;
  background: #171717;
  height: 100vh;
`
const Nav = styled.nav``
const ButtonItem = styled.button`
  align-items: center;
  background-color: transparent;
  border: 0px;
  justify-content: center;
  line-height: 24px;
  position: relative;
  text-decoration: none;
  transition: all 250ms;
  &:hover,
  &:focus {
  }
  &:active {
    color: white;
  }
  ${Text}
`
const Item = styled.li`
  margin: 0;
  padding-left: 20px;

  .menu {
    ${Text}
  }
  .active {
    color: white;
  }

  ${Text}
`
const Wrapper = styled.ul``

const MenuLink = ({ item }: { item: MenuItem }) => {
  const [showSubMenu, setShowSubMenu] = useState(false)
  const { icon = null, title, to } = item
  const isSubMenu = typeof to === 'object'

  return (
    <>
      {icon}
      <Item>
        {isSubMenu ? (
          <ButtonItem
            onClick={() => setShowSubMenu((showMenu) => !showMenu)}
          >{`${title} >`}</ButtonItem>
        ) : (
          <NavLink className="menu" href={to}>
            {title}
          </NavLink>
        )}
      </Item>

      {isSubMenu && showSubMenu
        ? to.map((target) => (
            <Item key={target.title}>
              <NavLink className="menu" href={target.to}>
                {target.title}
              </NavLink>
            </Item>
          ))
        : null}
    </>
  )
}

export const Sidebar = () => {
  const items: MenuItem[] = [
    {
      to: '/dashboard',
      icon: <Image alt="dashboard-icon" height="24px" src="/icons/Dashboard.svg" width="24px" />,
      title: 'Dashboard',
    },
    {
      to: '/deposit',
      icon: <Image alt="dashboard-icon" height="24px" src="/icons/Dashboard.svg" width="24px" />,
      title: 'Deposit Collateral',
    },
    {
      to: [
        {
          to: '#',
          title: 'AA',
        },
        {
          to: '/dashboard',
          title: 'AB',
        },
      ],
      icon: <Image alt="dashboard-icon" height="24px" src="/icons/Dashboard.svg" width="24px" />,
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
