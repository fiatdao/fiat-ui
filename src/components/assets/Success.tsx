import { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg`
  .fill {
    fill: ${({ theme }) => theme.colors.success};
  }
`

export const Success: React.FC<HTMLAttributes<SVGElement>> = ({ className }) => (
  <Wrapper
    className={`${className} success`}
    height="20"
    viewBox="0 0 20 20"
    width="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g className="fill">
      <path d="M10-.001a10 10 0 1010 10 10.011 10.011 0 00-10-10zm0 18.361a8.361 8.361 0 118.361-8.361A8.37 8.37 0 0110 18.361z" />
      <path d="M14.326 6.161l-5.942 5.938-2.71-2.715a.82.82 0 00-1.159 1.159l3.294 3.294a.82.82 0 001.159 0l6.516-6.516a.82.82 0 00-1.159-1.159z" />
    </g>
  </Wrapper>
)
