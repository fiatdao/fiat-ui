import s from './s.module.scss'
import React from 'react'
import AntdButton, { ButtonProps } from 'antd/lib/button'
import cn from 'classnames'

interface Props extends ButtonProps {
  isActive?: boolean
  height?: 'lg' | undefined
}

const ButtonOutline: React.FC<Props> = ({
  children,
  className,
  disabled,
  height,
  href,
  icon,
  isActive,
  type,
  ...restProps
}: Props) => {
  return (
    <span
      className={cn(
        s.background,
        { [s.lg]: height === 'lg' },
        { [s.disabled]: disabled },
        { [s.active]: isActive },
        className,
      )}
      {...restProps}
    >
      <span className={cn(s.border)}>
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
