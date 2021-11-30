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
import RedirectToProfile from '@/src/containers/RedirectToProfile'
import ToastContainer from '@/src/components/toast/Container'
import Web3ConnectionProvider from '@/src/providers/web3ConnectionProvider'
import WrongNetwork from '@/src/containers/WrongNetwork'
import { Footer } from '@/src/components/common/Footer'
import { GeneralError } from '@/src/components/common/GeneralError'
import { Header } from '@/src/containers/Header'
import { ContainerPadding } from '@/src/components/pureStyledComponents/common/Helpers'
import { Loading } from '@/src/components/common/Loading'
import AppStatusProvider from '@/src/providers/AppStatusProvider'

const MainWrapper = styled.main`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 0;
  height: calc(100vh - ${({ theme }) => theme.header.heightMobile});
  justify-content: center;
  padding: 50px 0;

  ${ContainerPadding}

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.desktopStart}) {
    height: calc(100vh - ${({ theme }) => theme.header.height});
  }
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
              <AppStatusProvider fallback={<Loading />}>
                <Header />
                <MainWrapper>
                  <Component {...pageProps} />
                </MainWrapper>
                <Footer />
                <WrongNetwork />
                <RedirectToProfile />
              </AppStatusProvider>
            </Web3ConnectionProvider>
          </ErrorBoundary>
        </SWRConfig>
        <ToastContainer />
      </ThemeProvider>
    </>
  )
}
export default App
