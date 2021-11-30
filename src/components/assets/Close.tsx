import { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg`
  &:active {
    opacity: 0.8;
  }

  .fill {
    fill: ${({ theme }) => theme.colors.textColorLight};
  }
`

export const Close: React.FC<HTMLAttributes<SVGElement>> = ({ className, ...restProps }) => (
  <Wrapper
    className={`${className} close`}
    height="10"
    viewBox="0 0 10 10"
    width="10"
    xmlns="http://www.w3.org/2000/svg"
    {...restProps}
  >
    <path
      className="fill"
      d="M5.884 4.999l3.933-3.931a.626.626 0 00-.885-.885L5 4.116 1.068.183a.625.625 0 00-.884.884l3.932 3.932L.183 8.932a.625.625 0 10.884.884L5 5.884l3.932 3.932a.625.625 0 00.884-.884z"
    />
  </Wrapper>
)
