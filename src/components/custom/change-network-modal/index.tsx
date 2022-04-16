import React from 'react'
import Grid from '@/src/components/custom/grid'
import HeaderInfoButton from '@/src/components/custom/header-info-button'
import Modal from '@/src/components/antd/modal'
import { ChainsValues, chainsConfig } from '@/src/constants/chains'
import { Text } from '@/src/components/custom/typography'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

const ChangeNetworkModal: React.FC = () => {
  const { changeNetworkModalOpen, setChangeNetworkModalOpen, setNetwork } = useWeb3Connection()

  const handleChangeNetwork = async (chainId: ChainsValues) => {
    setNetwork(chainId)
    setChangeNetworkModalOpen(false)
  }

  return (
    <Modal onCancel={() => null} visible={changeNetworkModalOpen} width={568}>
      <Grid align="start" flow="row" gap={24}>
        <Grid flow="row" gap={16}>
          <Text color="primary" type="h2" weight="bold">
            Change Network
          </Text>
          <Text color="secondary" type="p1" weight="semibold">
            Connect to a supported network below
          </Text>
          <Text color="secondary" type="p1">
            If you still encounter problems, you may want to switch to a different wallet
          </Text>
        </Grid>

        <Grid flow="col" gap={24}>
          {Object.keys(chainsConfig).map((chainIdStr: string) => {
            const chainId = parseInt(chainIdStr) as ChainsValues
            const chainConfig = chainsConfig[chainId]

            return (
              <HeaderInfoButton
                icon={<chainConfig.svg />}
                key={chainId}
                onClick={() => handleChangeNetwork(chainId)}
                text={chainsConfig[chainId].shortName}
              />
            )
          })}
        </Grid>
      </Grid>
    </Modal>
  )
}

export default ChangeNetworkModal
