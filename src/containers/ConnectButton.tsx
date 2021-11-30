import { ButtonConnect } from '../components/pureStyledComponents/buttons/Button'
import { useWeb3Connection } from '../providers/web3ConnectionProvider'

export const ConnectButton = ({ ...restProps }) => {
  const { connectWallet, isWalletConnected } = useWeb3Connection()

  return (
    (!isWalletConnected && (
      <ButtonConnect {...restProps} onClick={connectWallet}>
        Connect Wallet
      </ButtonConnect>
    )) ||
    null
  )
}

export default ConnectButton
