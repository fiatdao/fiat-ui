import { useEffect, useState } from 'react'
import styled from 'styled-components'
import Head from 'next/head'
import useSignIn from '@/src/hooks/useSignIn'
import genericSuspense from '@/src/utils/genericSuspense'
import { ButtonPrimary } from '@/src/components/pureStyledComponents/buttons/Button'
import { BaseTitle } from '@/src/components/pureStyledComponents/text/BaseTitle'
import { BaseParagraph } from '@/src/components/pureStyledComponents/text/BaseParagraph'
import { InnerContainer } from '@/src/components/pureStyledComponents/layout/InnerContainer'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import WalletButton from '@/src/containers/ConnectButton'
import { Spinner } from '@/src/components/common/Spinner'

const Title = styled(BaseTitle)``

function Connect({ ...restProps }) {
  const { signIn } = useSignIn({ redirectOnUser: '/profile', redirectNotRegistered: '/register' })
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
    <Spinner />
  ) : (
    <InnerContainer {...restProps}>
      {!isAppConnected ? (
        <>
          <Head>
            <title>Connect Your Wallet - FIAT</title>
          </Head>
          <Title>Connect Your Wallet</Title>
          <BaseParagraph>
            First we need you to connect your crypto wallet and sign the connection so we can trust
            it's you and only you that's connected to the app.
          </BaseParagraph>
          <WalletButton />
        </>
      ) : (
        <>
          <Head>
            <title>Sign Connection - FIAT</title>
          </Head>
          <Title>Wallet connected, please sign the connection to prove it's you.</Title>
          {<ButtonPrimary onClick={() => signIn()}>Sign Connection</ButtonPrimary>}
        </>
      )}
    </InnerContainer>
  )
}

export default genericSuspense(Connect)
