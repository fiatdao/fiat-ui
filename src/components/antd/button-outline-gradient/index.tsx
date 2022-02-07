import s from './s.module.scss'
import React from 'react'
import AntdButton, { ButtonProps } from 'antd/lib/button'
import cn from 'classnames'

interface Props extends ButtonProps {
  textGradient?: boolean
  height?: 'lg' | undefined
  isActive?: boolean
}

const ButtonOutline: React.FC<Props> = ({
  children,
  className,
  disabled,
  height,
  href,
  icon,
  isActive,
  textGradient,
  type,
  ...restProps
}: Props) => {
  return (
    <span
      className={cn(
        s.background,
        { [s.active]: isActive },
        { [s.disabled]: disabled },
        { [s.lg]: height === 'lg' },
        className,
      )}
      {...restProps}
    >
      <span className={cn(s.border)}>
        <AntdButton
          className={cn(s.button, { [s.textGradient]: textGradient })}
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
