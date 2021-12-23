import { useEffect, useState } from 'react'
import Head from 'next/head'
import genericSuspense from '@/src/utils/genericSuspense'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import WalletButton from '@/src/components/custom/connect-button'
import Spin from '@/src/components/antd/spin'

function Connect({ ...restProps }) {
  const { isAppConnected } = useWeb3Connection()
  const [loading, setLoading] = useState(true)

  // placeholder to prevent flicker until useSignIn is ready
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => {
      clearTimeout(timeout)
    }
  }, [])

  return loading ? (
    <Spin />
  ) : (
    <div {...restProps}>
      {!isAppConnected ? (
        <>
          <Head>
            <title>Connect Your Wallet - FIAT</title>
          </Head>
          <h1>Connect Your Wallet</h1>
          <p>
            First we need you to connect your crypto wallet and sign the connection so we can trust
            it's you and only you that's connected to the app.
          </p>
          <WalletButton />
        </>
      ) : (
        <>
          <Head>
            <title>Sign Connection - FIAT</title>
          </Head>
          <h1>Wallet connected, please sign the connection to prove it's you.</h1>
        </>
      )}
    </div>
  )
}

export default genericSuspense(Connect)
