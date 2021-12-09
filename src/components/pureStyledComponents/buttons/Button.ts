import styled, { css, keyframes } from 'styled-components'

export const DisabledButtonCSS = css`
  cursor: not-allowed;
  opacity: 0.5;
`

export const ButtonCSS = css`
  align-items: center;
  border-radius: 2px;
  border: 2px;
  cursor: pointer;
  display: inline-flex;
  flex-grow: 0;
  font-family: ${({ theme }) => theme.fonts.fontFamily};
  font-size: 1.7rem;
  font-weight: 600;
  height: ${({ theme }) => theme.buttonHeight};
  justify-content: center;
  line-height: 1;
  outline: none;
  padding: 0 25px;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  transition: all 0.15s ease-out;
  user-select: none;
  white-space: nowrap;

  &:active {
    opacity: 0.7;
  }
`

export const ButtonPrimaryCSS = css`
  background-color: ${({ theme }) => theme.buttonPrimary.backgroundColor};
  border-color: ${({ theme }) => theme.buttonPrimary.borderColor};
  color: ${({ theme }) => theme.buttonPrimary.color};

  &:hover {
    background-color: ${({ theme }) => theme.buttonPrimary.backgroundColorHover};
    border-color: ${({ theme }) => theme.buttonPrimary.borderColorHover};
    color: ${({ theme }) => theme.buttonPrimary.colorHover};
  }

  &[disabled],
  &[disabled]:hover {
    background-color: ${({ theme }) => theme.buttonPrimary.borderColor};
    border-color: ${({ theme }) => theme.buttonPrimary.borderColor};
    color: ${({ theme }) => theme.buttonPrimary.color};
    ${DisabledButtonCSS}
  }
`

const BaseButton = styled.button`
  ${ButtonCSS}
`

export const Button = styled(BaseButton)`
  &[disabled],
  &[disabled]:hover {
    ${DisabledButtonCSS}
  }
`

export const ButtonPrimary = styled(BaseButton)`
  ${ButtonPrimaryCSS}
`

const btnConnectAnimation = keyframes`
  0% {
    background-position: 50% 50%;
  }

  25% {
    background-position: 100% 50%;
  }

  50% {
    background-position: 50% 50%;
  }

  75% {
    background-position: 0% 50%;
  }

  100% {
    background-position: 50% 50%;
  }
`

export const ButtonConnectCSS = css`
  animation-delay: 0;
  animation-direction: normal;
  animation-duration: 4s;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
  background-position: 50% 50%;
  background-size: 300%;
  background: transparent;
  border: 1px solid #ff9574;
  border-radius: 4px;
  color: ${({ theme }) => theme.colors.textColor};
  height: ${({ theme }) => theme.buttonHeight};
  letter-spacing: -0.51px;

  &:hover {
    animation-name: ${btnConnectAnimation};
  }

  &[disabled],
  &[disabled]:hover {
    ${DisabledButtonCSS}
  }
`

export const ButtonConnect = styled(BaseButton)`
  ${ButtonConnectCSS}
`
