import { ButtonPrimary } from '../components/pureStyledComponents/buttons/Button'
import { useWeb3Connection } from '../providers/web3ConnectionProvider'

export const DisconnectButton = ({ ...restProps }) => {
  const { disconnectWallet, isWalletConnected } = useWeb3Connection()

  return (
    (isWalletConnected && (
      <ButtonPrimary {...restProps} onClick={disconnectWallet}>
        Disconnect
      </ButtonPrimary>
    )) ||
    null
  )
}

export default DisconnectButton
