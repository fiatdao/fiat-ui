import styled from 'styled-components'

export const BaseParagraph = styled.p`
  color: ${({ theme }) => theme.colors.textColor};
  font-size: 1.6rem;
  font-weight: 400;
  line-height: 1.8;
  margin: 0 0 50px;
  text-align: center;
  width: 100%;

  &:last-child {
    margin-bottom: 0;
  }

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletPortraitStart}) {
    font-size: 1.8rem;
  }
`

export const BaseParagraphBig = styled(BaseParagraph)`
  font-size: 2rem;
  font-weight: 500;
  line-height: 1.6;

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletPortraitStart}) {
    font-size: 2.2rem;
  }
`
