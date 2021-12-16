import s from './s.module.scss'
import Grid from '../../custom/grid'
import Icon from '../../custom/icon'
import { Text } from '../../custom/typography'
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
  const { className, fixScroll, label, loading, options, ...selectProps } = props

  return (
    <AntdSelect<T>
      className={cn(s.component, className)}
      dropdownClassName={s.dropdown}
      getPopupContainer={fixScroll ? (trigger) => trigger.parentNode : undefined}
      optionLabelProp="label"
      suffixIcon={loading ? <AntdSpin size="small" /> : <Icon name="dropdown-arrow" />}
      {...selectProps}
    >
      {options.map((option) => (
        <AntdSelect.Option
          {...option}
          className={s.option}
          key={option.value}
          label={
            <Grid flow="col" gap={12}>
              {label && (
                <Text color="secondary" type="p2">
                  {label}
                </Text>
              )}
              <Text color="primary" type="p2" weight="500">
                {option.label}
              </Text>
            </Grid>
          }
          value={option.value}
        >
          {option.label}
        </AntdSelect.Option>
      ))}
    </AntdSelect>
  )
}

export default Select
