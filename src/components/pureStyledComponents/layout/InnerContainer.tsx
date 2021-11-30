import styled from 'styled-components'

export const InnerContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  margin: 0 auto;
  max-width: ${({ theme }) => theme.layout.maxWidthInner};
  width: 100%;
`
