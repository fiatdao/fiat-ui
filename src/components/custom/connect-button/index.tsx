import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

export const ConnectButton = ({ ...restProps }) => {
  const { connectWallet } = useWeb3Connection()

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events
    <div className="button-ghost" onClick={connectWallet} role="button" tabIndex={0} {...restProps}>
      <span>Connect wallet</span>
    </div>
  )
}

export default ConnectButton
