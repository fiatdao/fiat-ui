import s from './s.module.scss'
import React from 'react'
import AntdButton, { ButtonProps } from 'antd/lib/button'
import cn from 'classnames'

interface Props extends ButtonProps {
  height?: 'lg' | undefined
}

const ButtonGradient: React.FC<Props> = ({
  children,
  className,
  disabled,
  height,
  ...restProps
}: Props) => {
  return (
    <AntdButton
      className={cn(s.component, { [s.lg]: height === 'lg' }, className)}
      disabled={disabled}
      {...restProps}
    >
      {children}
    </AntdButton>
  )
}

export default ButtonGradient
