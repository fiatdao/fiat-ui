import s from './s.module.scss'
import React from 'react'
import AntdButton, { ButtonProps } from 'antd/lib/button'
import cn from 'classnames'

const ButtonGradient: React.FC<ButtonProps> = ({
  children,
  className,
  disabled,
  ...restProps
}: ButtonProps) => {
  return (
    <AntdButton className={cn(s.component, className)} disabled={disabled} {...restProps}>
      {children}
    </AntdButton>
  )
}

export default ButtonGradient
