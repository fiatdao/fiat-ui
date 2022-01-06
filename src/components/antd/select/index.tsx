import s from './s.module.scss'
import React from 'react'
import AntdSelect, {
  OptionProps as AntdOptionProps,
  SelectProps as AntdSelectProps,
  SelectValue as AntdSelectValue,
} from 'antd/lib/select'
import AntdSpin from 'antd/lib/spin'
import cn from 'classnames'

export type SelectOption = Partial<AntdOptionProps> & {
  label: React.ReactNode
  value: string | number
}

export type SelectProps<T> = AntdSelectProps<T> & {
  label?: React.ReactNode
  options: SelectOption[]
  fixScroll?: boolean
}

const Select: React.FC<SelectProps<AntdSelectValue>> = <T extends AntdSelectValue>(
  props: React.PropsWithChildren<SelectProps<T>>,
) => {
  const { className, fixScroll, loading, options, ...selectProps } = props

  return (
    <AntdSelect<T>
      {...selectProps}
      className={cn(s.button, className)}
      dropdownClassName={cn(s.dropdown)}
      getPopupContainer={fixScroll ? (trigger) => trigger.parentNode : undefined}
      onChange={() => console.log('onChange')}
      optionLabelProp="label"
      virtual={false}
    >
      {options.map((item, index) => (
        <AntdSelect.Option
          {...item}
          className={cn(s.item)}
          disabled={false}
          key={index}
          value={item.value}
        >
          {item.label}
        </AntdSelect.Option>
      ))}
    </AntdSelect>
  )
}

export default Select
