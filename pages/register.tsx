import { useRouter } from 'next/router'
import Head from 'next/head'
import styled from 'styled-components'

import useSignIn from '@/src/hooks/useSignIn'
import PersonalDataForm from '@/src/containers/PersonalDataForm'
import { SALE_STATUS, USER } from '@/types/api'
import genericSuspense from '@/src/utils/genericSuspense'
import useSubmitRegister from '@/src/hooks/useSubmitRegister'
import useSignature from '@/src/hooks/useSignature'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { useAppStatus } from '@/src/providers/AppStatusProvider'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

function Register({ ...restProps }) {
  const { signInSignature, user } = useSignIn()
  const { address } = useWeb3Connection()

  const registerUser = useSubmitRegister()
  const router = useRouter()
  const sign = useSignature()
  const appStatus = useAppStatus()

  async function handleSubmitCreate(formData: USER) {
    const res = await registerUser({
      walletAddress: address || '',
      method: 'post',
      formData,
      signature: signInSignature as string,
    })

    if (res) {
      router.push(`/verify-email?email=${formData.email}`)
    }
  }

  async function handleSubmitEdit(formData: USER) {
    const signature = await sign(formData)

    if (!signature) {
      return null
    }

    const res = await registerUser({
      walletAddress: address || '',
      method: 'patch',
      formData,
      signature,
    })

    if (res) {
      router.push('/profile')
    }
  }

  if (appStatus?.status !== SALE_STATUS.REGISTER) {
    return <div>Registration phase has finished.</div>
  }

  return (
    <>
      <Head>
        <title>Raffle Registration - FIAT</title>
      </Head>
      <Wrapper {...restProps}>
        <PersonalDataForm onSubmit={user ? handleSubmitEdit : handleSubmitCreate} user={user} />
      </Wrapper>
    </>
  )
}

export default genericSuspense(Register)
