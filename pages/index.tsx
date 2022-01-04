import Head from 'next/head'
import genericSuspense from '@/src/utils/genericSuspense'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import WalletButton from '@/src/components/custom/connect-button'

function Connect({ ...restProps }) {
  const { isWalletConnected } = useWeb3Connection()

  return (
    <div {...restProps}>
      {!isWalletConnected ? (
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
          <h1>This is the dashboard.</h1>
        </>
      )}
    </div>
  )
}

export default genericSuspense(Connect)
