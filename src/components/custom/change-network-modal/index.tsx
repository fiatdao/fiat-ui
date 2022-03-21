import React from 'react'

import Modal, { ModalProps } from '@/src/components/antd/modal'
import Grid from '@/src/components/custom/grid'
import { Text } from '@/src/components/custom/typography'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

export type ChangeNetworkModalProps = ModalProps

const ChangeNetworkModal: React.FC<ChangeNetworkModalProps> = (props) => {
  const { ...modalProps } = props
  const { changeNetworkModalOpen, connectWallet, setChangeNetworkModalOpen } = useWeb3Connection()

  const handleClick = () => {
    connectWallet
    setChangeNetworkModalOpen(false)
  }

  return (
    <Modal visible={changeNetworkModalOpen} width={568} {...modalProps}>
      <Grid align="start" flow="row" gap={24}>
        <Grid flow="row" gap={16}>
          <Text color="primary" type="h2" weight="bold">
            Wrong network
          </Text>
          <Text color="secondary" type="p1" weight="semibold">
            Please switch your wallet network to
            {/* {ethWeb3.networkName ?? '<!>'}  */}
            to use the app
          </Text>
          <Text color="secondary" type="p1">
            If you still encounter problems, you may want to switch to a different wallet
          </Text>
        </Grid>

        <button className="button-ghost" onClick={handleClick} type="button">
          <span>Switch wallet</span>
        </button>
      </Grid>
    </Modal>
  )
}

export default ChangeNetworkModal
