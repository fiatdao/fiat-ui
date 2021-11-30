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

export default function Faq({ ...restProps }) {
  return (
    <>
      <Head>
        <title>FAQ - FIAT</title>
      </Head>
      <Wrapper {...restProps}>
        <Title>FAQ</Title>
        <p>FAQ section</p>
      </Wrapper>
    </>
  )
}
