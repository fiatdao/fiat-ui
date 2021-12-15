import { ConnectButton as BaseConnectButton } from './ConnectButton'
import ConnectedWallet from './ConnectedWallet'
import { useWeb3Connection } from '../providers/web3ConnectionProvider'
import styled from 'styled-components'

import { Layout } from 'antd'

import {
  ActiveButton,
  ContainerPadding,
} from '@/src/components/pureStyledComponents/common/Helpers'
import { DisabledButtonCSS } from '@/src/components/pureStyledComponents/buttons/Button'

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

const ConnectButton = styled(BaseConnectButton)`
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

export const Header: React.FC = () => {
  const { address, isWalletConnected } = useWeb3Connection()

  return (
    <Layout.Header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      <EndWrapper>
        <Menu>{isWalletConnected && address && <>Connected.</>}</Menu>
        <MobileMenuButton>
          <svg height="29" width="36" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="#fff" strokeWidth="3">
              <path d="M0 1.5h36" />
              <path d="M0 14.5h36" />
              <path d="M0 27.5h36" />
            </g>
          </svg>
        </MobileMenuButton>
        {isWalletConnected && address ? <ConnectedWallet /> : <ConnectButton />}
      </EndWrapper>
    </Layout.Header>
  )
}
