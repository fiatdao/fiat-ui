import { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg`
  .fill {
    fill: ${({ theme }) => theme.colors.primary};
  }
`

export const ExternalLink: React.FC<HTMLAttributes<SVGElement>> = ({ className, ...restProps }) => (
  <Wrapper
    className={`${className} externalLink`}
    height="8"
    viewBox="0 0 8 8"
    width="8"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <g transform="translate(-1 -1)">
      <path
        className="fill"
        d="M8.111,8.111H1.889V1.889H4.111V1H1.889A.889.889,0,0,0,1,1.889V8.111A.889.889,0,0,0,1.889,9H8.111A.889.889,0,0,0,9,8.111V5.889H8.111Z"
      />
      <path
        className="fill"
        d="M13.2,1H9.644l1.462,1.462L8.56,5.009l.631.631,2.547-2.547L13.2,4.556Z"
        transform="translate(-4.2)"
      />
    </g>
  </Wrapper>
)
