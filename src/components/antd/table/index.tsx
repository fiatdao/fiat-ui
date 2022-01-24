import s from './s.module.scss'
import React from 'react'
import AntdTable, { TableProps as AntdTableProps } from 'antd/lib/table'
import cn from 'classnames'

const Table = <T extends Record<string, any>>(
  props: React.PropsWithChildren<AntdTableProps<T>>,
): React.ReactElement => {
  const { className, pagination, ...tableProps } = props

  return (
    <AntdTable<T>
      bordered={false}
      className={cn(s.component, className)}
      pagination={
        pagination
          ? {
              showSizeChanger: false,
              ...pagination,
            }
          : false
      }
      showSorterTooltip={false}
      {...tableProps}
    />
  )
}

export default Table
