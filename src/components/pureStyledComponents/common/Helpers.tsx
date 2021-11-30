import { css } from 'styled-components'

export const ActiveButton = css`
  &:active {
    transition: opacity 0.15s linear;
    opacity: 0.75;
  }
`

export const DisabledButton = css`
  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
    pointer-events: none;
  }
`

export const ContainerPadding = css`
  padding-left: ${({ theme }) => theme.layout.horizontalPaddingMobile};
  padding-right: ${({ theme }) => theme.layout.horizontalPaddingMobile};

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletPortraitStart}) {
    padding-left: ${({ theme }) => theme.layout.horizontalPaddingTabletPortraitStart};
    padding-right: ${({ theme }) => theme.layout.horizontalPaddingTabletPortraitStart};
  }

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.tabletLandscapeStart}) {
    padding-left: ${({ theme }) => theme.layout.horizontalPaddingTabletLandscapeStart};
    padding-right: ${({ theme }) => theme.layout.horizontalPaddingTabletLandscapeStart};
  }

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.desktopStart}) {
    padding-left: ${({ theme }) => theme.layout.horizontalPaddingDesktopStart};
    padding-right: ${({ theme }) => theme.layout.horizontalPaddingDesktopStart};
  }
`
