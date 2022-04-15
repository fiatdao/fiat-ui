import React from 'react'
import Modal from '@/src/components/antd/modal'
import Grid from '@/src/components/custom/grid'
import { Text } from '@/src/components/custom/typography'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { INITIAL_APP_CHAIN_ID } from '@/src/constants/chains'

// TODO: show all the chain options (eth, goerli)
const ChangeNetworkModal: React.FC = () => {
  const { changeNetworkModalOpen, setChangeNetworkModalOpen, setNetwork } = useWeb3Connection()

  const handleClick = () => {
    setNetwork(INITIAL_APP_CHAIN_ID)
    setChangeNetworkModalOpen(false)
  }

  return (
    <Modal onCancel={() => null} visible={changeNetworkModalOpen} width={568}>
      <Grid align="start" flow="row" gap={24}>
        <Grid flow="row" gap={16}>
          <Text color="primary" type="h2" weight="bold">
            Wrong network
          </Text>
          <Text color="secondary" type="p1" weight="semibold">
            Please switch your wallet network to Ethereum to use the app
          </Text>
          <Text color="secondary" type="p1">
            If you still encounter problems, you may want to switch to a different wallet
          </Text>
        </Grid>

        <button className="button-ghost" onClick={handleClick} type="button">
          <span>Switch Network</span>
        </button>
      </Grid>
    </Modal>
  )
}

export default ChangeNetworkModal
