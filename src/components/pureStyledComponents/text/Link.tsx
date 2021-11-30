import styled from 'styled-components'

import { ExternalLink as BaseExternalLink } from '@/src/components/assets/ExternalLink'

export const Link = styled.a`
  color: inherit;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

export const ExternalLink = styled(BaseExternalLink)`
  margin: 0 0 0 4px;

  .fill {
    fill: inherit;
  }
`
