/* eslint-disable @typescript-eslint/no-non-null-assertion */
import s from './s.module.scss'
import { ControlOutlined, DownOutlined, SafetyOutlined, WalletOutlined } from '@ant-design/icons'
import cn from 'classnames'
import React from 'react'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { getEtherscanAddressUrl, shortenAddr } from '@/src/web3/utils'
import Divider from '@/src/components/antd/divider'
import Popover from '@/src/components/antd/popover'
import ExternalLink from '@/src/components/custom/externalLink'
import Grid from '@/src/components/custom/grid'
import Identicon from '@/src/components/custom/identicon'
import { Text } from '@/src/components/custom/typography'

const ConnectedWallet: React.FC = () => {
  const { address, appChainId, disconnectWallet, wallet } = useWeb3Connection()

  const AccountSection = (
    <Popover
      className={s.popover}
      content={
        <div className="card">
          <Grid align="center" className="card-header" flow="col" gap={16} justify="start">
            <Identicon address={address!} height={40} width={40} />
            <ExternalLink href={getEtherscanAddressUrl(address!)}>
              <Text className={s.addressStr} tag="p" type="p1" weight="semibold">
                {shortenAddr(address!, 8, 8)}
              </Text>
            </ExternalLink>
          </Grid>
          <Grid flow="row" gap={32} padding={[32, 24]}>
            <Grid colsTemplate="24px 1fr auto" flow="col" gap={16}>
              {/* <Icon name="node-status" /> */}
              <SafetyOutlined className={s.icon} size={48} />
              <Text color="secondary" type="p1">
                Status
              </Text>
              <Text className={s.statusTag} tag="p" type="lb2" weight="semibold">
                Connected
              </Text>
            </Grid>
            <Grid colsTemplate="24px 1fr auto" flow="col" gap={16}>
              <WalletOutlined className={s.icon} size={48} />
              <Text color="secondary" type="p1">
                Wallet
              </Text>
              <Text color="primary" type="p1" weight="semibold">
                {wallet?.name}
              </Text>
            </Grid>
            <Grid colsTemplate="24px 1fr auto" flow="col" gap={16}>
              {/* <Icon name="network" /> */}
              <ControlOutlined className={s.icon} size={48} />
              <Text color="secondary" type="p1">
                Network
              </Text>
              <Text color="primary" type="p1" weight="semibold">
                {appChainId}
              </Text>
            </Grid>
          </Grid>
          <Divider />
          <Grid padding={24}>
            <button className="button button-ghost" onClick={disconnectWallet} type="button">
              <span>Disconnect</span>
            </button>
          </Grid>
        </div>
      }
      noPadding
      placement="bottomRight"
      trigger="click"
    >
      <a className={s.accountLink}>
        <Grid align="center" flow="col">
          <Identicon address={address!} className="mr-8" height={24} width={24} />
          <Text className={cn(s.walletAddress, 'mr-4')} color="primary" type="p1">
            {shortenAddr(address!, 4, 3)}
          </Text>
          <DownOutlined />
        </Grid>
      </a>
    </Popover>
  )

  return (
    <Grid align="center" flow="col" gap={20} justify="center">
      {AccountSection}
    </Grid>
  )
}

export default ConnectedWallet
