import { theme } from 'theme/index'
import { createGlobalStyle } from 'styled-components'

type ThemeType = typeof theme

export const GlobalStyle = createGlobalStyle<{ theme: ThemeType }>`
  @font-face {
    font-display: swap;
    font-family: "Inter";
    font-style: normal;
    font-weight: 400;
    src: local("Inter"), url("/fonts/Inter-Regular.ttf") format("truetype");
  }

  html {
    font-size: 10px;
    scroll-behavior: smooth;
  }

  body {
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    background-color: ${({ theme }) => theme.colors.mainBodyBackground};
    color: ${({ theme }) => theme.colors.textColor};
    font-family: ${({ theme }) => theme.fonts.fontFamily};
    font-size: ${({ theme }) => theme.fonts.defaultSize};
    min-height: 100vh;
  }

  code {
    font-family: ${({ theme }) => theme.fonts.fontFamilyCode};
  }

  #__next {
    display: flex;
    flex-direction: column;
    height: 100vh;
  }
`
