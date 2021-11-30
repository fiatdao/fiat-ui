import { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg`
  .fill {
    fill: ${({ theme }) => theme.colors.warning};
  }
`

export const Warning: React.FC<HTMLAttributes<SVGElement>> = ({ className }) => (
  <Wrapper
    className={`${className} warning`}
    height="19.995"
    viewBox="0 0 20 19.995"
    width="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g className="fill" transform="translate(-10.947 -11.023)">
      <path d="M30.809 29.718l-9.118-18.231a.832.832 0 00-1.49 0l-9.17 18.325a.839.839 0 00.747 1.2h18.341a.832.832 0 00.69-1.294zm-17.684-.363l7.82-15.631 7.82 15.631z" />
      <path d="M20.111 18.871v5.138a.833.833 0 101.665 0v-5.138a.833.833 0 00-1.665 0z" />
      <circle cx=".837" cy=".837" r=".837" transform="translate(20.107 26.102)" />
    </g>
  </Wrapper>
)
