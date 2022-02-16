import s from './s.module.scss'
import { useRouter } from 'next/router'
import { Layout } from 'antd'
import cn from 'classnames'
import { Drawer } from 'antd'
import { useState } from 'react'
import { useGeneral } from '@/src/providers/generalProvider'
import { ConnectButton } from '@/src/components/custom/connect-button'
import { routesConfig } from '@/src/constants/navigation'
import ConnectedWallet from '@/src/components/custom/connected-wallet'
import { Logo } from '@/src/components/custom/logo'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Menu } from '@/src/components/custom/menu'
import { SideMenuFooter } from '@/src/components/custom/side-menu-footer'
import { ButtonMobileMenu } from '@/src/components/custom/button-mobile-menu'

export const Header: React.FC = ({ ...restProps }) => {
  const { title: pageTitle } = useGeneral()
  const { address, isWalletConnected } = useWeb3Connection()
  const router = useRouter()
  const title: string = pageTitle ?? routesConfig[router.route]?.title ?? '-'
  const [drawerVisible, setDrawerVisible] = useState(false)

  return (
    <>
      <Layout.Header className={cn(s.component)} {...restProps}>
        <h1 className={cn(s.title)}>{title}</h1>
        <Logo className={cn(s.logoWrapper)} />
        <div className={cn(s.endWrapper)}>
          {isWalletConnected && address ? <ConnectedWallet /> : <ConnectButton />}
          <ButtonMobileMenu
            drawerVisible={drawerVisible}
            onClick={() => setDrawerVisible((prev) => !prev)}
          />
        </div>
      </Layout.Header>
      <Drawer
        className={cn(s.drawer)}
        closable={false}
        visible={drawerVisible}
        width={'100%'}
        {...restProps}
      >
        <Menu onClick={() => setDrawerVisible(false)} />
        <SideMenuFooter className={cn(s.sideMenuFooter)} />
      </Drawer>
    </>
  )
}
