import { ConnectButton } from '../connect-button'
import { Layout } from 'antd'
import { useRouter } from 'next/router'
import ConnectedWallet from '@/src/components/custom/connected-wallet'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { Text } from '@/src/components/custom/typography'
import { routesConfig } from '@/src/constants/navigation'

export const Header: React.FC = () => {
  const { address, isWalletConnected } = useWeb3Connection()
  const router = useRouter()
  const title: string = routesConfig[router.route].title

  return (
    <Layout.Header style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
      <Text color="white" style={{ flex: '1' }} type="h2">
        {title}
      </Text>
      <div>
        <button>
          <svg height="29" width="36" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="#fff" strokeWidth="3">
              <path d="M0 1.5h36" />
              <path d="M0 14.5h36" />
              <path d="M0 27.5h36" />
            </g>
          </svg>
        </button>
        {isWalletConnected && address ? <ConnectedWallet /> : <ConnectButton />}
      </div>
    </Layout.Header>
  )
}
