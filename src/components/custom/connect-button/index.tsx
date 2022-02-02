import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'

export const ConnectButton = ({ ...restProps }) => {
  const { connectWallet } = useWeb3Connection()

  return (
    <ButtonOutlineGradient height="lg" onClick={connectWallet} {...restProps}>
      <span>Connect wallet</span>
    </ButtonOutlineGradient>
  )
}

export default ConnectButton
