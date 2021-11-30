import { HTMLAttributes } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'

import { BaseCard } from '@/src/components/pureStyledComponents/common/BaseCard'
import { Close } from '@/src/components/assets/Close'
import { ButtonPrimary } from '@/src/components/pureStyledComponents/buttons/Button'

const Wrapper = styled.div`
  align-items: center;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  left: 0;
  position: fixed;
  top: 0;
  width: 100vw;
  z-index: 100;
`

const Card = styled(BaseCard)<{ size?: modalSize }>`
  display: flex;
  flex-direction: column;
  min-height: 300px;
  padding: 22px 32px;
  width: ${({ size }) =>
    size === 'sm' ? '325px' : size === 'md' ? '440px' : size === 'lg' ? '600px' : `${size}`};
`

const TitleWrapper = styled.div`
  column-gap: 10px;
  display: grid;
  flex-shrink: 0;
  grid-template-columns: 1fr 20px;
  margin-bottom: 32px;
`

const Title = styled.h1`
  color: ${({ theme }) => theme.colors.textColorLigher};
  font-size: 1.8rem;
  font-weight: medium;
  line-height: 1.2;
  margin: 0;
`

const CloseButton = styled.button`
  align-items: center;
  background-color: transparent;
  border: none;
  cursor: pointer;
  display: flex;
  height: 20px;
  justify-content: center;
  margin: -4px 0 0 0;
  padding: 0;
  position: relative;
  right: -4px;
  width: 20px;

  .fill {
    transition: fill 0.1s linear;
  }

  &:hover {
    .fill {
      fill: #fff;
    }
  }

  &:active {
    opacity: 0.7;
  }

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const Contents = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`

const Buttons = styled.div`
  margin-top: auto;
  padding-top: 50px;
`

const Button = styled(ButtonPrimary)`
  width: 100%;
`

export type modalSize = 'sm' | 'md' | 'lg' | string

interface Props extends HTMLAttributes<HTMLDivElement> {
  isConfirmDisabled?: boolean
  onConfirm?: () => void
  confirmText?: string
  onClose?: () => void
  size?: modalSize
  title: string
}

export const Modal: React.FC<Props> = ({
  children,
  confirmText = 'Confirm',
  isConfirmDisabled,
  onClose,
  onConfirm,
  size = 'sm',
  title,
  ...restProps
}: Props) => {
  const portal: HTMLElement | null = document.getElementById('modals')

  return (
    portal &&
    ReactDOM.createPortal(
      <Wrapper onClick={onClose} {...restProps}>
        <Card
          onClick={(e) => {
            e.stopPropagation()
          }}
          size={size}
        >
          <TitleWrapper>
            <Title>{title}</Title>
            {onClose && (
              <CloseButton onClick={onClose}>
                <Close />
              </CloseButton>
            )}
          </TitleWrapper>
          <Contents>{children}</Contents>
          <Buttons>
            {onConfirm && (
              <Button disabled={isConfirmDisabled} onClick={onConfirm}>
                {confirmText}
              </Button>
            )}
          </Buttons>
        </Card>
      </Wrapper>,
      portal,
    )
  )
}
