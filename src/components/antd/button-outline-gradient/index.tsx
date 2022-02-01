import s from './s.module.scss'
import React from 'react'
import AntdButton, { ButtonProps } from 'antd/lib/button'
import cn from 'classnames'

interface Props extends ButtonProps {
  height?: 'lg' | undefined
}

const ButtonOutline: React.FC<Props> = ({
  children,
  className,
  disabled,
  height,
  href,
  icon,
  type,
  ...restProps
}: Props) => {
  return (
    <span
      className={cn(s.wrapper, { [s.lg]: height === 'lg' }, { [s.disabled]: disabled }, className)}
      {...restProps}
    >
      <span className={cn(s.background)}>
        <AntdButton
          className={cn(s.button)}
          disabled={disabled}
          href={href}
          icon={icon}
          type={type}
        >
          {children}
        </AntdButton>
      </span>
    </span>
  )
}

export default ButtonOutline
