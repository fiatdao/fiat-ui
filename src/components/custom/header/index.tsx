import s from './s.module.scss'
import { ConnectButton } from '../connect-button'
import { Layout } from 'antd'
import { useRouter } from 'next/router'
import cn from 'classnames'
import ConnectedWallet from '@/src/components/custom/connected-wallet'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { routesConfig } from '@/src/constants/navigation'

export const Header: React.FC = ({ ...restProps }) => {
  const { address, isWalletConnected } = useWeb3Connection()
  const router = useRouter()
  const title: string = routesConfig[router.route]?.title || '-'

  return (
    <Layout.Header className={cn(s.component)} {...restProps}>
      <h1 className={cn(s.title)}>{title}</h1>
      <div>
        {/* <button>
          <svg height="29" width="36" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="#fff" strokeWidth="3">
              <path d="M0 1.5h36" />
              <path d="M0 14.5h36" />
              <path d="M0 27.5h36" />
            </g>
          </svg>
        </button> */}
        {isWalletConnected && address ? <ConnectedWallet /> : <ConnectButton />}
      </div>
    </Layout.Header>
  )
}
