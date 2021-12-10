import s from './s.module.scss'
import React from 'react'
import AntdInput, { InputProps as AntdInputProps } from 'antd/lib/input'
import cn from 'classnames'

export type InputProps = AntdInputProps

const Input: React.FC<InputProps> = (props) => {
  const { className, disabled, ...inputProps } = props

  return (
    <AntdInput
      autoComplete="off"
      className={cn(s.component, className, disabled && s.disabled)}
      disabled={disabled}
      {...inputProps}
    />
  )
}

export default Input
