import styled from 'styled-components'

export const BaseTitle = styled.h1`
  color: ${({ theme }) => theme.colors.color_1};
  font-family: Inter, sans-serif;
  font-size: 5.1rem;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 0 30px;
  text-align: center;
  text-transform: uppercase;
  width: 100%;

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletPortraitStart}) {
    font-size: 6.2rem;
  }
`
