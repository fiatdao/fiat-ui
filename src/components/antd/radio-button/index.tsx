import s from './s.module.scss'
import Grid from '../../custom/grid'
import React from 'react'
import AntdRadio, { RadioProps as AntdRadioProps } from 'antd/lib/radio'
import cn from 'classnames'

export type RadioButtonProps = {
  label: React.ReactNode
  hint?: React.ReactNode
}

const RadioButton: React.FC<AntdRadioProps & RadioButtonProps> = (props) => {
  const { className, hint, label, ...radioProps } = props

  return (
    <AntdRadio className={cn(s.component, className)} {...radioProps}>
      <Grid flow="row" gap={4}>
        <span>{label}</span>
        <span>{hint}</span>
      </Grid>
    </AntdRadio>
  )
}

export default RadioButton
