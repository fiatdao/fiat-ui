import { useWeb3Connection } from '../../../providers/web3ConnectionProvider'
import { Modal } from '../../to-be-deprecated/Modal'
import { chainsConfig } from '@/src/constants/chains'

export default function WrongNetwork() {
  const { appChainId, isAppConnected, isWalletConnected, pushNetwork } = useWeb3Connection()

  if (!isWalletConnected || (isWalletConnected && isAppConnected)) {
    return null
  }

  return (
    <Modal title="Wrong network">
      <button onClick={pushNetwork}>Switch to {chainsConfig[appChainId].name}</button>
    </Modal>
  )
}
