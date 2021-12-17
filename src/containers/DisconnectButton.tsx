import { useWeb3Connection } from '../providers/web3ConnectionProvider'

export const DisconnectButton = ({ ...restProps }) => {
  const { disconnectWallet, isWalletConnected } = useWeb3Connection()

  return (
    (isWalletConnected && (
      <button {...restProps} onClick={disconnectWallet}>
        Disconnect
      </button>
    )) ||
    null
  )
}

export default DisconnectButton
