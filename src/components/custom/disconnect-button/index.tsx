import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

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
