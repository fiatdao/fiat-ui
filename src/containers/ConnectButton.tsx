import { ButtonConnect } from '../components/pureStyledComponents/buttons/Button'
import { useWeb3Connection } from '../providers/web3ConnectionProvider'

export const ConnectButton = ({ ...restProps }) => {
  const { connectWallet } = useWeb3Connection()

  return (
    <ButtonConnect {...restProps} className="button-ghost" onClick={connectWallet} type="button">
      <span>Connect wallet</span>
    </ButtonConnect>
  )
}

export default ConnectButton
