import Head from 'next/head'
import type { AppProps } from 'next/app'
import { SWRConfig } from 'swr'
import { Layout } from 'antd'
import SafeSuspense from '@/src/components/custom/safe-suspense'
import GeneralContextProvider from '@/src/providers/generalProvider'
import Web3ConnectionProvider from '@/src/providers/web3ConnectionProvider'
import KnownTokensProvider from '@/src/providers/knownTokensProvider'
import ChangeNetworkModal from '@/src/components/custom/change-network-modal'
import { Sidebar } from '@/src/components/custom/sidebar'
import Spin from '@/src/components/antd/spin'

import '@/src/styles/index.scss'
import { Header } from '@/src/components/custom/header'

function App({ Component, pageProps }: AppProps) {
  const { hostname, port, protocol } =
    typeof window !== 'undefined'
      ? window.location
      : { hostname: 'localhost', port: 3000, protocol: 'http:' }
  const portString = port ? `:${port}` : ''
  const siteURL = typeof window !== 'undefined' ? `${protocol}//${hostname}${portString}` : ''
  const title = 'FIAT'
  const description = 'FIAT'
  const twitterHandle = '@'

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta content="summary_large_image" name="twitter:card" />
        <meta content="website" property="og:type" />
        <meta content={`${siteURL}/shareable/ogImage.jpg`} property="og:image" />
        <meta content={description} name="description" />
        <meta content={description} property="og:description" />
        <meta content={siteURL} property="og:url" />
        <meta content={title} name="twitter:site" />
        <meta content={title} property="og:title" />
        <meta content={twitterHandle} name="twitter:creator" />
        <link href="/favicon/favicon.svg" rel="icon" type="image/svg+xml" />
        <link href="/favicon/favicon.png" rel="icon" type="image/png"></link>
        <link href="/favicon/apple-touch-icon.png" rel="apple-touch-icon" sizes="180x180" />
        <link href="/favicon/favicon-32x32.png" rel="icon" sizes="32x32" type="image/png" />
        <link href="/favicon/favicon-16x16.png" rel="icon" sizes="16x16" type="image/png" />
        <link href="/favicon/site.webmanifest" rel="manifest" />
        <link color="#5bbad5" href="/favicon/safari-pinned-tab.svg" rel="mask-icon" />
        <meta content="#da532c" name="msapplication-TileColor" />
        <meta content="#ffffff" name="theme-color" />
      </Head>
      <GeneralContextProvider>
        <SWRConfig
          value={{
            suspense: true,
            revalidateOnFocus: false,
            errorRetryCount: 0,
            shouldRetryOnError: false,
            revalidateOnMount: true,
            refreshWhenHidden: false,
            refreshWhenOffline: false,
          }}
        >
          <Web3ConnectionProvider fallback={<Spin />}>
            <KnownTokensProvider>
              <Layout style={{ minHeight: '100vh' }}>
                <Sidebar />
                <Layout>
                  <Header />
                  <Layout.Content>
                    <SafeSuspense fallback={<Spin />}>
                      <Component {...pageProps} />
                    </SafeSuspense>
                  </Layout.Content>
                </Layout>
              </Layout>
            </KnownTokensProvider>
            <ChangeNetworkModal onCancel={() => null} />
          </Web3ConnectionProvider>
        </SWRConfig>
      </GeneralContextProvider>
    </>
  )
}
export default App
