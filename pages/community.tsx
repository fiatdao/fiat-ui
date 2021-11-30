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

export default function Community({ ...restProps }) {
  return (
    <>
      <Head>
        <title>Community - FIAT</title>
      </Head>
      <Wrapper {...restProps}>
        <Title>Community</Title>
        <p>Community section</p>
      </Wrapper>
    </>
  )
}
