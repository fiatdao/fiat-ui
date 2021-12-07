import 'react-toastify/dist/ReactToastify.css'
import 'sanitize.css'
import { GlobalStyle } from 'theme/globalStyle'
import { theme } from 'theme'
import Head from 'next/head'
import styled from 'styled-components'
import type { AppProps } from 'next/app'
import { ErrorBoundary } from 'react-error-boundary'
import { SWRConfig } from 'swr'
import { ThemeProvider } from 'styled-components'
import ToastContainer from '@/src/components/toast/Container'
import Web3ConnectionProvider from '@/src/providers/web3ConnectionProvider'
import WrongNetwork from '@/src/containers/WrongNetwork'
import { GeneralError } from '@/src/components/common/GeneralError'
import { Header } from '@/src/containers/Header'
import { Loading } from '@/src/components/common/Loading'
import { Sidebar } from '@/src/components/navigation/Sidebar'

const MainWrapper = styled.div`
  display: grid;
  grid-template-rows: 88px auto;
  grid-template-columns: 256px auto;
  grid-template-areas:
    'sidebar  header '
    'sidebar content';
`
const ContentWrapper = styled.div`
  grid-area: content;
  padding: 40px;
  background: rgba(32, 32, 32, 0.95);
`
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
        <SWRConfig value={{ suspense: true, revalidateOnFocus: false }}>
          <ErrorBoundary fallbackRender={(props) => <GeneralError {...props} />}>
            <Web3ConnectionProvider fallback={<Loading />}>
              <MainWrapper>
                <Sidebar />
                <Header />
                <ContentWrapper>
                  <Component {...pageProps} />
                </ContentWrapper>
              </MainWrapper>
              <WrongNetwork />
            </Web3ConnectionProvider>
          </ErrorBoundary>
        </SWRConfig>
        <ToastContainer />
      </ThemeProvider>
    </>
  )
}
export default App
