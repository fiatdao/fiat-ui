import s from './s.module.scss'
import React from 'react'
import AntdSlider, { SliderSingleProps } from 'antd/lib/slider'
import cn from 'classnames'

const Slider: React.FC<SliderSingleProps> = (props) => {
  const { className, ...restProps } = props

  return (
    <AntdSlider className={cn(s.component, className)} tooltipPlacement="bottom" {...restProps} />
  )
}

export default Slider
