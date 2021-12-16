import s from './s.module.scss'
import React from 'react'
import { CheckboxOptionType } from 'antd/lib/checkbox/Group'
import AntdRadio, { RadioGroupProps as AntdRadioGroupProps } from 'antd/lib/radio'
import cn from 'classnames'

export type YesNoSelectorProps = AntdRadioGroupProps

const YesNoOptions: CheckboxOptionType[] = [
  {
    label: 'Yes',
    value: true,
  },
  {
    label: 'No',
    value: false,
  },
]

const YesNoSelector: React.FC<YesNoSelectorProps> = (props) => {
  const { className, ...groupProps } = props

  return (
    <AntdRadio.Group
      buttonStyle="outline"
      className={cn(s.component, className)}
      optionType="button"
      options={YesNoOptions}
      {...groupProps}
    />
  )
}

export default YesNoSelector
