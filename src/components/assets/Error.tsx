import { HTMLAttributes } from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg`
  .fill {
    fill: ${({ theme }) => theme.colors.error};
  }
`

export const Error: React.FC<HTMLAttributes<SVGElement>> = ({ className }) => (
  <Wrapper
    className={`${className} warning`}
    height="20"
    viewBox="0 0 20 20"
    width="20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      className="fill"
      d="M9.999 0a10 10 0 1010 10 10 10 0 00-10-10zm0 18.976A8.977 8.977 0 1118.976 10a8.976 8.976 0 01-8.977 8.976z"
    />
    <path className="fill" d="M11.138 12.272l.438-9H8.438l.436 9z" />
    <path
      className="fill"
      d="M10.011 13.265a1.808 1.808 0 00-.04 3.615h.04a1.808 1.808 0 000-3.615z"
    />
  </Wrapper>
)
