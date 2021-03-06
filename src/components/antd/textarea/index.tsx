import s from './s.module.scss'
import React from 'react'
import AntdInput, { TextAreaProps as AntdTextAreaProps } from 'antd/lib/input'
import cn from 'classnames'

export type TextareaProps = AntdTextAreaProps

const Textarea: React.FC<TextareaProps> = (props) => {
  const { className, ...inputProps } = props

  return <AntdInput.TextArea className={cn(s.component, className)} {...inputProps} />
}

export default Textarea
