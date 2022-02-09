import s from './s.module.scss'
import React from 'react'
import AntdSlider, { SliderSingleProps } from 'antd/lib/slider'
import cn from 'classnames'

export interface SliderProps extends SliderSingleProps {
  healthFactorVariant?: boolean
}

const Slider: React.FC<SliderProps> = (props) => {
  const { className, healthFactorVariant, ...restProps } = props

  return (
    <AntdSlider
      className={cn(s.component, { [s.healthFactorVariant]: healthFactorVariant }, className)}
      tooltipPlacement="bottom"
      {...restProps}
    />
  )
}

export default Slider
