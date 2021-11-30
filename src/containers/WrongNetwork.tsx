import { ButtonPrimary } from '../components/pureStyledComponents/buttons/Button'
import { useWeb3Connection } from '../providers/web3ConnectionProvider'
import { Modal } from '../components/common/Modal'
import { chainsConfig } from '@/src/constants/chains'

export default function WrongNetwork() {
  const { appChainId, isAppConnected, isWalletConnected, pushNetwork } = useWeb3Connection()

  if (!isWalletConnected || (isWalletConnected && isAppConnected)) {
    return null
  }

  return (
    <Modal title="Wrong network">
      <ButtonPrimary onClick={pushNetwork}>Switch to {chainsConfig[appChainId].name}</ButtonPrimary>
    </Modal>
  )
}
