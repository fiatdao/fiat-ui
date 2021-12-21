import s from './s.module.scss'
import { ConnectButton } from '../connect-button'
import { Layout } from 'antd'
import { useRouter } from 'next/router'
import cn from 'classnames'
import ConnectedWallet from '@/src/components/custom/connected-wallet'
import { Logo } from '@/src/components/custom/logo'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { routesConfig } from '@/src/constants/navigation'
import BurgerMenu from '@/src/resources/svg/burger-menu.svg'

export const Header: React.FC = ({ ...restProps }) => {
  const { address, isWalletConnected } = useWeb3Connection()
  const router = useRouter()
  const title: string = routesConfig[router.route]?.title || '-'

  return (
    <Layout.Header className={cn(s.component)} {...restProps}>
      <h1 className={cn(s.title)}>{title}</h1>
      <Logo className={cn(s.logoWrapper)} />
      <div className={cn(s.endWrapper)}>
        {isWalletConnected && address ? <ConnectedWallet /> : <ConnectButton />}
        <button className={cn(s.mobileButton)}>
          <BurgerMenu />
        </button>
      </div>
    </Layout.Header>
  )
}
