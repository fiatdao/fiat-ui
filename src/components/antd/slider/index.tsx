import s from './s.module.scss'
import React from 'react'
import AntdSlider, { SliderSingleProps } from 'antd/lib/slider'
import cn from 'classnames'

export interface SliderProps extends SliderSingleProps {
  healthFactorVariant?: boolean
  healthFactorVariantReverse?: boolean
}

const Slider: React.FC<SliderProps> = (props) => {
  const { className, healthFactorVariant, healthFactorVariantReverse, ...restProps } = props

  return (
    <AntdSlider
      className={cn(
        s.component,
        className,
      )}
      tooltipPlacement="bottom"
      {...restProps}
    />
  )
}

export default Slider
