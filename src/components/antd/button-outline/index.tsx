import s from './s.module.scss'
import React from 'react'
import AntdButton, { ButtonProps } from 'antd/lib/button'
import cn from 'classnames'

interface Props extends ButtonProps {
  isActive?: boolean
  height?: 'lg' | undefined
  rounded?: boolean
}

const ButtonOutline: React.FC<Props> = ({
  children,
  className,
  disabled,
  height,
  icon,
  isActive,
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
        { [s.active]: isActive },
        className,
      )}
      {...restProps}
    >
      <span className={cn(s.border)}>
        <AntdButton className={cn(s.button)} disabled={disabled} icon={icon}>
          {children}
        </AntdButton>
      </span>
    </span>
  )
}

export default ButtonOutline
