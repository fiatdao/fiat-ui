import Form from '@/src/components/antd/form'
import Popover from '@/src/components/antd/popover'

import Badge from '@/src/components/custom/badge'
import Icon from '@/src/components/custom/icon'
import AntdForm from 'antd/lib/form'
import React, { useState } from 'react'

export type TableFilterType = {
  name: string
  label: React.ReactNode
  itemRender: () => React.ReactNode
  defaultValue: any
}

type Props = {
  filters: TableFilterType[]
  value?: Record<string, any>
  onChange: (values: Record<string, any>) => void
}

const TableFilter: React.FC<Props> = (props) => {
  const { filters, onChange, value } = props

  const [form] = AntdForm.useForm<Record<string, any>>()
  const [visible, setVisible] = useState<boolean>(false)

  const initialValues = React.useMemo(
    () =>
      filters.reduce((a, c) => {
        return {
          ...a,
          [c.name]: c.defaultValue,
        }
      }, {}),
    [filters],
  )

  const countApplied = React.useMemo(() => {
    let count = 0

    if (value) {
      filters.forEach((filter) => {
        if (value[filter.name] !== filter.defaultValue) {
          count++
        }
      })
    }

    return count
  }, [filters, value])

  React.useEffect(() => {
    if (value) {
      form.setFieldsValue(value)
    }
  }, [form, value])

  function handleSubmit(values: Record<string, any>) {
    setVisible(false)
    onChange(values)
  }

  const Content = (
    <Form
      form={form}
      initialValues={initialValues}
      onFinish={handleSubmit}
      validateTrigger={['onSubmit']}
    >
      {filters.map((filter) => (
        <Form.Item className="mb-32" key={filter.name} label={filter.label} name={filter.name}>
          {filter.itemRender()}
        </Form.Item>
      ))}
      <div className="grid flow-col align-center justify-space-between">
        <button className="button-text" onClick={() => form.resetFields()} type="button">
          Reset filters
        </button>
        <button className="button-primary" type="submit">
          Apply filters
        </button>
      </div>
    </Form>
  )

  return (
    <Popover
      content={Content}
      onVisibleChange={setVisible}
      overlayStyle={{ width: 348 }}
      placement="bottomRight"
      title="Filters"
      visible={visible}
    >
      <button className="button-ghost-monochrome pv-16" type="button">
        <Icon className="mr-8" color="inherit" name="filter" />
        <span className="mr-8">Filters</span>
        <Badge>{countApplied}</Badge>
      </button>
    </Popover>
  )
}

export default TableFilter
