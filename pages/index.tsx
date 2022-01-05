import Head from 'next/head'
import genericSuspense from '@/src/utils/genericSuspense'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import WalletButton from '@/src/components/custom/connect-button'

import { InfoBlocksGrid } from '@/src/components/custom/info-blocks-grid'
import { InfoBlock } from '@/src/components/custom/info-block'

function Connect({ ...restProps }) {
  const { isWalletConnected } = useWeb3Connection()
  const mockedInfo = [
    {
      title: 'Liquidations',
      value: '750,000,000 FIAT',
      footer: '$749,236,165',
    },
    {
      title: 'FIAT Repaid',
      value: '150,000,000 FIAT',
      footer: '$749,236,165',
    },
    {
      title: 'Liquidations',
      value: '50,000,000 FIAT',
      footer: '$749,236,165',
    },
    {
      title: 'FIAT price',
      value: '$1.01',
      footer: (
        <a className="text-gradient" href="https://google.com" rel="noreferrer" target="_blank">
          Buy on Matcha
        </a>
      ),
    },
    {
      title: 'FIAT Users',
      value: '1,132',
      footer: '320 last 30d',
    },
    {
      title: 'Active positions',
      value: '165',
    },
    {
      title: 'Supported protocols',
      value: '4',
    },
    {
      title: 'Audits',
      value: '2',
    },
  ]

  return !isWalletConnected ? (
    <>
      <Head>
        <title>Connect Your Wallet - FIAT</title>
      </Head>
      <h1>Please Connect Your Wallet</h1>
      <WalletButton />
    </>
  ) : (
    <>
      <Head>
        <title>Dashboard - FIAT</title>
      </Head>
      <InfoBlocksGrid>
        {mockedInfo.map((item, index) => (
          <InfoBlock footer={item.footer} key={index} title={item.title} value={item.value} />
        ))}
      </InfoBlocksGrid>
    </>
  )
}

export default genericSuspense(Connect)
