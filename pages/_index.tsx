import Head from 'next/head'
import withRequiredConnection from '@/src/hooks/RequiredConnection'

import { InfoBlocksGrid } from '@/src/components/custom/info-blocks-grid'
import { InfoBlock } from '@/src/components/custom/info-block'

function Connect() {
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

  return (
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

export default withRequiredConnection(Connect)
