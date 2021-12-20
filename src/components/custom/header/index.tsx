import s from './s.module.scss'
import { ConnectButton } from '../connect-button'
import { Layout } from 'antd'
import { useRouter } from 'next/router'
import Link from 'next/link'
import cn from 'classnames'
import ConnectedWallet from '@/src/components/custom/connected-wallet'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { routesConfig } from '@/src/constants/navigation'
import BurgerMenu from '@/src/resources/svg/burger-menu.svg'
import FiatDaoLogo from '@/src/resources/svg/fiat-dao-logo-2.svg'

export const Header: React.FC = ({ ...restProps }) => {
  const { address, isWalletConnected } = useWeb3Connection()
  const router = useRouter()
  const title: string = routesConfig[router.route]?.title || '-'

  return (
    <Layout.Header className={cn(s.component)} {...restProps}>
      <h1 className={cn(s.title)}>{title}</h1>
      <Link href="/" passHref>
        <a className={cn(s.logoWrapper)}>
          <FiatDaoLogo />
          <span className={cn(s.logoText)}>App</span>
        </a>
      </Link>
      <div className={cn(s.endWrapper)}>
        {isWalletConnected && address ? <ConnectedWallet /> : <ConnectButton />}
        <button className={cn(s.mobileButton)}>
          <BurgerMenu />
        </button>
      </div>
    </Layout.Header>
  )
}
