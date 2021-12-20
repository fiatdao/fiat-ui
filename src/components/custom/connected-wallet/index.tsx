/* eslint-disable @typescript-eslint/no-non-null-assertion */
import s from './s.module.scss'
import cn from 'classnames'
import React from 'react'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { getEtherscanAddressUrl, shortenAddr } from '@/src/web3/utils'
import Divider from '@/src/components/antd/divider'
import Popover from '@/src/components/antd/popover'
import ExternalLink from '@/src/components/custom/externalLink'
import Grid from '@/src/components/custom/grid'
import Identicon from '@/src/components/custom/identicon'
import AccountImage from '@/src/resources/svg/account_img.svg'
import ChevronDown from '@/src/resources/svg/chevron-down.svg'
import Status from '@/src/resources/svg/node-status.svg'
import Wallet from '@/src/resources/svg/wallet.svg'
import Network from '@/src/resources/svg/network.svg'

const ConnectedWallet: React.FC = () => {
  const { address, appChainId, disconnectWallet, wallet } = useWeb3Connection()
  const colstTemplate = '24px 1fr auto'

  return (
    <Grid align="center" flow="col" gap={20} justify="center">
      <Popover
        className={s.popover}
        content={
          <div className="card">
            <Grid align="center" className="card-header" flow="col" gap={16} justify="start">
              <Identicon address={address!} height={40} width={40} />
              <ExternalLink className={s.addressStr} href={getEtherscanAddressUrl(address!)}>
                {shortenAddr(address!, 8, 8)}
              </ExternalLink>
            </Grid>
            <Grid flow="row" gap={32} padding={[32, 24]}>
              <Grid colsTemplate={colstTemplate} flow="col" gap={16}>
                <Status className={cn(s.itemIcon)} />
                <span className={cn(s.itemText)}>Status</span>
                <span className={s.itemStatusBadge}>Connected</span>
              </Grid>
              <Grid colsTemplate={colstTemplate} flow="col" gap={16}>
                <Wallet className={cn(s.itemIcon)} />
                <span className={cn(s.itemText)}>Wallet</span>
                <span className={cn(s.itemStatus)}>{wallet?.name}</span>
              </Grid>
              <Grid colsTemplate={colstTemplate} flow="col" gap={16}>
                <Network className={cn(s.itemIcon)} />
                <span className={cn(s.itemText)}>Network</span>
                <span className={cn(s.itemStatus)}>{appChainId}</span>
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
        <button className={cn('button-ghost', s.dropdownButton)}>
          <span className={cn(s.dropdownButtonContents)}>
            <AccountImage />
            <span className={cn(s.walletAddress)}>{shortenAddr(address!, 4, 3)}</span>
            <ChevronDown className={cn(s.dropdownArrow)} />
          </span>
        </button>
      </Popover>
    </Grid>
  )
}

export default ConnectedWallet
