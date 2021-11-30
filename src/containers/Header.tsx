import { ConnectButton as BaseConnectButton } from './ConnectButton'
import { DisconnectButton as BaseDisconnectButton } from './DisconnectButton'
import { useWeb3Connection } from '../providers/web3ConnectionProvider'
import Link from 'next/link'
import styled from 'styled-components'

import {
  ActiveButton,
  ContainerPadding,
} from '@/src/components/pureStyledComponents/common/Helpers'
import { DisabledButtonCSS } from '@/src/components/pureStyledComponents/buttons/Button'

const Wrapper = styled.header`
  align-items: flex-end;
  background-color: ${({ theme }) => theme.colors.mainBodyBackground};
  display: flex;
  flex-shrink: 0;
  height: ${({ theme }) => theme.header.heightMobile};
  justify-content: space-between;
  margin: 0;
  position: sticky;
  top: 0;
  z-index: 100;

  ${ContainerPadding}

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletLandscapeStart}) {
    position: relative;
  }

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.desktopStart}) {
    background-color: transparent;
    height: ${({ theme }) => theme.header.height};
  }
`

const Logo = styled.div`
  background-image: url('images/logo.png');
  background-position: 50% 50%;
  background-repeat: no-repeat;
  background-size: contain;
  cursor: pointer;
  flex-shrink: 0;
  height: 62px;
  text-decoration: none;
  user-select: none;
  width: 249px;

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletLandscapeStart}) {
    margin-bottom: -10px;
  }

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.desktopStart}) {
    height: 81px;
    margin-bottom: -25px;
    width: 366px;
  }

  ${ActiveButton}
`

const EndWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: ${({ theme }) => theme.header.heightMobile};
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 1234;

  &.is-open {
    height: 100vh;
  }

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletLandscapeStart}) {
    align-items: center;
    display: flex;
    flex-direction: row;
    height: ${({ theme }) => theme.buttonHeight};
    left: auto;
    margin: auto 0 0 0;
    position: relative;
    top: auto;
    width: auto;
  }
`

const Menu = styled.nav`
  background-color: rgba(0, 0, 0, 0.6);
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  display: none;
  flex-direction: column;
  height: calc(100vh - ${({ theme }) => theme.header.heightMobile} + 1px);
  margin-top: -1px;

  &.is-open {
    display: flex;
  }

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletLandscapeStart}) {
    background-color: transparent;
    border: none;
    display: flex;
    flex-direction: row;
    height: auto;
    margin: 0 40px 0 0;
  }
`

const Item = styled.span`
  align-items: center;
  background-color: ${({ theme }) => theme.colors.mainBodyBackground};
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--main-text-color);
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-size: 1.8rem;
  font-weight: 500;
  height: 44px;
  justify-content: flex-start;
  line-height: 1.2;
  padding: 0 ${({ theme }) => theme.layout.horizontalPaddingMobile};
  text-decoration: none;
  text-transform: uppercase;
  user-select: none;
  width: 100%;

  &:last-child {
    margin-right: 0;
  }

  ${ActiveButton}

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletPortraitStart}) {
    padding: 0 ${({ theme }) => theme.layout.horizontalPaddingTabletPortraitStart};
  }

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletLandscapeStart}) {
    align-items: unset;
    background-color: transparent;
    border: none;
    display: unset;
    height: auto;
    justify-content: unset;
    margin-right: 30px;
    padding: 0;
    width: auto;
  }
`

const ConnectButton = styled(BaseConnectButton)`
  display: none;

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletLandscapeStart}) {
    display: flex;
  }
`

const DisconnectButton = styled(BaseDisconnectButton)`
  display: none;

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletLandscapeStart}) {
    display: flex;
  }
`

const MobileMenuButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  height: ${({ theme }) => theme.header.heightMobile};
  justify-content: center;
  margin: 0 ${({ theme }) => theme.layout.horizontalPaddingMobile} 0 auto;
  padding: 0;
  user-select: none;
  width: 40px;

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletPortraitStart}) {
    margin-right: var(--horizontal-padding-tablet-portrait-start);
  }

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletLandscapeStart}) {
    display: none;
  }

  ${ActiveButton}

  &[disabled],
  &[disabled]:hover {
    ${DisabledButtonCSS}
  }
`

export const Header: React.FC = (props) => {
  const { isWalletConnected } = useWeb3Connection()

  return (
    <Wrapper as="header" {...props}>
      <Link href="/" passHref>
        <Logo />
      </Link>
      <EndWrapper>
        <Menu>
          <Link href="/about" passHref>
            <Item>About</Item>
          </Link>
          <Link href="/how-to" passHref>
            <Item>How To</Item>
          </Link>
          <Link href="/community" passHref>
            <Item>Community</Item>
          </Link>
          {isWalletConnected && (
            <>
              Hello stranger...
            </>
          )}
        </Menu>
        <MobileMenuButton>
          <svg height="29" width="36" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="#fff" strokeWidth="3">
              <path d="M0 1.5h36" />
              <path d="M0 14.5h36" />
              <path d="M0 27.5h36" />
            </g>
          </svg>
        </MobileMenuButton>
        <ConnectButton />
        <DisconnectButton />
      </EndWrapper>
    </Wrapper>
  )
}
