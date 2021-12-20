/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/interactive-supports-focus */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { HTMLAttributes } from 'react'
import ReactDOM from 'react-dom'

export type modalSize = 'sm' | 'md' | 'lg' | string

interface Props extends HTMLAttributes<HTMLDivElement> {
  isConfirmDisabled?: boolean
  onConfirm?: () => void
  confirmText?: string
  onClose?: () => void
  title: string
}

export const Modal: React.FC<Props> = ({
  children,
  confirmText = 'Confirm',
  isConfirmDisabled,
  onClose,
  onConfirm,
  title,
  ...restProps
}: Props) => {
  const portal: HTMLElement | null = document.getElementById('modals')

  return (
    portal &&
    ReactDOM.createPortal(
      <div onClick={onClose} role="alert" {...restProps}>
        <div
          onClick={(e) => {
            e.stopPropagation()
          }}
          role="group"
          // size={size}
        >
          <div>
            <h1>{title}</h1>
            {onClose && (
              <div onClick={onClose} role="button">
                X
              </div>
            )}
          </div>
          <div>{children}</div>
          <div>
            {onConfirm && (
              <button disabled={isConfirmDisabled} onClick={onConfirm}>
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>,
      portal,
    )
  )
}
