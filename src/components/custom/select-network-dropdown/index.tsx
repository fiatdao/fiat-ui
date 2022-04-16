import s from './s.module.scss'
import cn from 'classnames'
import React, { useState } from 'react'
import { Text } from '@/src/components/custom/typography'
import HeaderInfoButton from '@/src/components/custom/header-info-button'
import { ChainsValues, chainsConfig, getNetworkConfig } from '@/src/constants/chains'
import { Divider, Popover } from '@/src/components/antd'
import Grid from '@/src/components/custom/grid'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'

const ConnectedWallet: React.FC = () => {
  const { setNetwork, walletChainId } = useWeb3Connection()
  const [visible, setVisible] = useState<boolean>(false)

  const availableChains = Object.keys(chainsConfig)
    .filter((chain) => Number(chain) !== walletChainId)
    .map((chain) => {
      return chainsConfig[Number(chain) as ChainsValues]
    })

  const currentChainConfig = getNetworkConfig(walletChainId as ChainsValues)

  return (
    <Grid align="center" flow="col" gap={20} justify="center">
      <Popover
        className={s.popover}
        content={
          <>
            <Grid flow="row" gap={15}>
              <Grid flow="col">
                <Text color="primary" type="p2" weight="bold">
                  Select a Network
                </Text>
              </Grid>
              <Divider />
              {availableChains.map((item, index) => (
                <button
                  className={cn(s.networkButton)}
                  key={index}
                  onClick={() => {
                    setNetwork(item.chainId)
                    setVisible(false)
                  }}
                >
                  <Text color="primary" type="p2">
                    {item.shortName}
                  </Text>
                </button>
              ))}
            </Grid>
          </>
        }
        onVisibleChange={setVisible}
        placement="bottomRight"
        trigger="click"
        visible={visible}
      >
        {currentChainConfig === undefined ? null : (
          <HeaderInfoButton
            className={cn(s.infoButton)}
            icon={<currentChainConfig.svg />}
            text={currentChainConfig.shortName}
          />
        )}
      </Popover>
    </Grid>
  )
}

export default ConnectedWallet
