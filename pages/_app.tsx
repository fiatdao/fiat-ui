import 'react-toastify/dist/ReactToastify.css'
import 'sanitize.css'
import '@/src/styles/index.scss'
import { GlobalStyle } from 'theme/globalStyle'
import { theme } from 'theme'
import Head from 'next/head'
import type { AppProps } from 'next/app'
import { ErrorBoundary } from 'react-error-boundary'
import { SWRConfig } from 'swr'
import { ThemeProvider } from 'styled-components'
import { Layout } from 'antd'
import GeneralContextProvider from '@/src/components/providers/general-provider'
import ToastContainer from '@/src/components/toast/Container'
import Web3ConnectionProvider from '@/src/providers/web3ConnectionProvider'
import WrongNetwork from '@/src/containers/WrongNetwork'
import { GeneralError } from '@/src/components/common/GeneralError'
import { Header } from '@/src/containers/Header'
import { Loading } from '@/src/components/common/Loading'
import { Sidebar } from '@/src/components/navigation/Sidebar'

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
        <meta content={description} name="description" />
        <meta content={title} property="og:title" />
        <meta content={siteURL} property="og:url" />
        <meta content={`${siteURL}/shareable/ogImage.jpg`} property="og:image" />
        <meta content="website" property="og:type" />
        <meta content={description} property="og:description" />
        <meta content="summary_large_image" name="twitter:card" />
        <meta content={title} name="twitter:site" />
        <meta content={twitterHandle} name="twitter:creator" />
      </Head>
      <ThemeProvider theme={theme}>
        <GlobalStyle />
        <GeneralContextProvider>
          <SWRConfig value={{ suspense: true, revalidateOnFocus: false }}>
            <ErrorBoundary fallbackRender={(props) => <GeneralError {...props} />}>
              <Web3ConnectionProvider fallback={<Loading />}>
                <Layout>
                  <Sidebar />
                  <Layout>
                    <Header />
                    <Layout.Content>
                      <Component {...pageProps} />
                    </Layout.Content>
                  </Layout>
                </Layout>
                <WrongNetwork />
              </Web3ConnectionProvider>
            </ErrorBoundary>
          </SWRConfig>
        </GeneralContextProvider>
        <ToastContainer />
      </ThemeProvider>
    </>
  )
}
export default App
