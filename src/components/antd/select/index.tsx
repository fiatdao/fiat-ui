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
      getPopupContainer={fixScroll ? (trigger) => trigger.parentNode : undefined}
      onChange={() => console.log('onChange')}
      optionLabelProp="label"
      suffixIcon={
        loading ? (
          <AntdSpin size="small" />
        ) : (
          <svg
            fill="none"
            height="6"
            viewBox="0 0 10 6"
            width="10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M4.29279 5.29289L0.707007 1.70711C0.0770425 1.07714 0.523209 0 1.41411 0H8.58569C9.47659 0 9.92276 1.07714 9.29279 1.70711L5.70701 5.29289C5.31648 5.68342 4.68332 5.68342 4.29279 5.29289Z"
              fill="#505050"
            />
          </svg>
        )
      }
      virtual={false}
    >
      {options.map((item) => (
        <AntdSelect.Option
          {...item}
          className={cn(s.option)}
          disabled={false}
          key={item.value}
          value={item.value}
        >
          {item.label}
        </AntdSelect.Option>
      ))}
    </AntdSelect>
  )
}

export default Select
