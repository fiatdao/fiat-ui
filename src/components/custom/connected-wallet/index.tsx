/* eslint-disable @typescript-eslint/no-non-null-assertion */
import s from './s.module.scss'
import ButtonOutlineGradient from '@/src/components/antd/button-outline-gradient'
import Divider from '@/src/components/antd/divider'
import Popover from '@/src/components/antd/popover'
import ExternalLink from '@/src/components/custom/externalLink'
import Grid from '@/src/components/custom/grid'
import Identicon from '@/src/components/custom/identicon'
import SafeSuspense from '@/src/components/custom/safe-suspense'
import { ZERO_ADDRESS } from '@/src/constants/misc'
import useUserProxy from '@/src/hooks/useUserProxy'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import AccountImage from '@/src/resources/svg/account_img.svg'
import ChevronDown from '@/src/resources/svg/chevron-down.svg'
import Network from '@/src/resources/svg/network.svg'
import Status from '@/src/resources/svg/node-status.svg'
import Wallet from '@/src/resources/svg/wallet.svg'
import { getEtherscanAddressUrl, shortenAddr } from '@/src/web3/utils'
import cn from 'classnames'
import React from 'react'

const ProxyAddressCard = () => {
  const { appChainId } = useWeb3Connection()
  const { userProxyAddress } = useUserProxy()

  return userProxyAddress !== ZERO_ADDRESS ? (
    <div className={s.proxyCard}>
      <p className={s.proxyCardHeader}>Proxy Address</p>
      <ExternalLink
        className={s.proxyCardAddress}
        href={getEtherscanAddressUrl(userProxyAddress!, appChainId)}
      >
        {shortenAddr(userProxyAddress!, 18, 8)}
      </ExternalLink>
    </div>
  ) : (
    <></>
  )
}

const ConnectedWallet: React.FC = () => {
  const { address, appChainId, disconnectWallet, wallet } = useWeb3Connection()
  const colstTemplate = '24px 1fr auto'

  return (
    <Grid align="center" flow="col" gap={20} justify="center">
      <Popover
        className={s.popover}
        content={
          <>
            <Grid align="start" className="card-header" flow="row" gap={16} justify="start">
              <Grid align="center" flow="col" gap={16} justify="start">
                <Identicon address={address!} height={40} width={40} />
                <ExternalLink
                  className={s.addressStr}
                  href={getEtherscanAddressUrl(address!, appChainId)}
                >
                  {shortenAddr(address!, 12, 8)}
                </ExternalLink>
              </Grid>

              <SafeSuspense>
                <ProxyAddressCard />
              </SafeSuspense>
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
              <ButtonOutlineGradient height="lg" onClick={disconnectWallet}>
                Disconnect
              </ButtonOutlineGradient>
            </Grid>
          </>
        }
        placement="bottomRight"
        trigger="click"
      >
        <ButtonOutlineGradient className={cn(s.dropdownButton)} height="lg">
          <span className={cn(s.dropdownButtonContents)}>
            <AccountImage />
            <span className={cn(s.walletAddress)}>{shortenAddr(address!, 4, 3)}</span>
            <ChevronDown className={cn(s.dropdownArrow)} />
          </span>
        </ButtonOutlineGradient>
      </Popover>
    </Grid>
  )
}

export default ConnectedWallet
