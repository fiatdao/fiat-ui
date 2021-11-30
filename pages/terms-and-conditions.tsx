import styled from 'styled-components'
import Head from 'next/head'

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

export default function TermsAndConditions({ ...restProps }) {
  return (
    <>
      <Head>
        <title>Terms and Conditions - FIAT</title>
      </Head>
      <Wrapper {...restProps}>
        <Title>Terms and Conditions</Title>
        <p>Terms and Conditions section</p>
      </Wrapper>
    </>
  )
}
