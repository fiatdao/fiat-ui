import s from './s.module.scss'
import React from 'react'
import AntdButton, { ButtonProps } from 'antd/lib/button'
import cn from 'classnames'

interface Props extends ButtonProps {
  height?: 'lg' | undefined
  rounded?: boolean
}

const ButtonOutline: React.FC<Props> = ({
  children,
  className,
  disabled,
  height,
  rounded,
  ...restProps
}: Props) => {
  return (
    <span
      className={cn(
        s.background,
        { [s.lg]: height === 'lg' },
        { [s.rounded]: rounded },
        { [s.disabled]: disabled },
        className,
      )}
      {...restProps}
    >
      <span className={cn(s.border)}>
        <AntdButton className={cn(s.button)} disabled={disabled}>
          {children}
        </AntdButton>
      </span>
    </span>
  )
}

export default ButtonOutline
