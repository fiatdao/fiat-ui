import { useEffect } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import Head from 'next/head'
import { useRouter } from 'next/router'

import useSignIn from '@/src/hooks/useSignIn'
import genericSuspense from '@/src/utils/genericSuspense'
import ResendEmail from '@/src/containers/ResendEmail'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Title = styled.h1`
  font-size: 2.2rem;
  margin: 20px auto 30px;
`

function VerifyProfile() {
  const router = useRouter()
  const { email } = router.query
  const { signInSignature, user } = useSignIn({
    redirectNotRegistered: '/register',
  })

  useEffect(() => {
    if (!email) {
      throw new Error('Email query params is required')
    }
  }, [email])

  useEffect(() => {
    if (user?.email_verified) {
      router.push('/profile')
    }
  }, [user, router])

  if (!user) {
    return <div>Loading...</div>
  }

  return (
    <>
      <Head>
        <Title>Please verify your E-mail</Title>
      </Head>
      <Wrapper>
        <div>
          <p>Almost there! We sent an email to {email}</p>
          <p>
            Just click on the link in that email to complete your registration. If you don't see it,
            you may have to check your SPAM folder.
          </p>
          <p>Still can't find the email?</p>
          {!user?.email_verified && <ResendEmail signature={signInSignature} />}
        </div>
        <Link href="/register">
          <a>Edit</a>
        </Link>
      </Wrapper>
    </>
  )
}

export default genericSuspense(VerifyProfile)
