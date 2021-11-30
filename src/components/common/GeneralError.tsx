import styled, { css } from 'styled-components'
import { FallbackProps } from 'react-error-boundary'
//import { Info as BaseInfo } from '@/src/components/assets/Info'

const Wrapper = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  height: 100%;
  justify-content: center;
  width: 100%;
`

// const InfoIcon = styled(BaseInfo)`
//   --dimensions: 50px;

//   display: block;
//   height: var(--dimensions);
//   margin: 0 auto 20px;
//   width: var(--dimensions);
// `

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.textColorLighter};
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.2;
  margin: 0 0 10px;
  text-align: center;
  width: 100%;
`

const TextCSS = css`
  color: ${({ theme }) => theme.colors.textColorLighter};
  font-size: 1.8rem;
  font-weight: 500;
  line-height: 1.4;
  text-align: center;
`

const Error = styled.div`
  ${TextCSS}
  width: 100%;

  & p {
    ${TextCSS}
    margin: 0 0 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`

export const GeneralError = ({ error }: FallbackProps) => {
  return (
    <Wrapper>
      {/* <InfoIcon /> */}
      <Title>There was an error</Title>
      <Error>{error}</Error>
    </Wrapper>
  )
}
