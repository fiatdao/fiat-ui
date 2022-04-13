import s from './s.module.scss'
import HeaderInfoButton from '../header-info-button'
import { ChainsValues, chainsConfig } from '../../../constants/chains'
import { Text } from '../typography'
import cn from 'classnames'
import React, { useState } from 'react'
import { Divider, Popover } from '@/src/components/antd'

import Grid from '@/src/components/custom/grid'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import Ethereum from '@/src/resources/svg/ethereum.svg'

const ConnectedWallet: React.FC = () => {
  const { setNetwork, walletChainId } = useWeb3Connection()
  const [visible, setVisible] = useState<boolean>(false)

  const availableChains = Object.keys(chainsConfig)
    .filter((chain) => Number(chain) !== walletChainId)
    .map((chain) => {
      return chainsConfig[Number(chain) as ChainsValues]
    })

  return (
    <Grid align="center" flow="col" gap={20} justify="center">
      <Popover
        className={s.popover}
        content={
          <>
            <Grid flow="row" gap={15}>
              <Grid flow="col" gap={0}>
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
        <HeaderInfoButton
          className={cn(s.infoButton)}
          icon={<Ethereum />}
          text={chainsConfig[walletChainId as ChainsValues]?.shortName}
        />
      </Popover>
    </Grid>
  )
}

export default ConnectedWallet
