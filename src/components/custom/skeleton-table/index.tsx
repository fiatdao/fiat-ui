import { Skeleton, SkeletonProps } from 'antd'
import { ColumnsType } from 'antd/lib/table'
import { Table } from '@/src/components/antd'

export type SkeletonTableColumnsType = {
  key: string
}

type SkeletonTableProps = SkeletonProps & {
  columns: ColumnsType<SkeletonTableColumnsType>
  rowCount?: number
}

export default function Index({
  active = false,
  children,
  className,
  columns,
  loading = false,
  rowCount = 5,
}: SkeletonTableProps): JSX.Element {
  return loading ? (
    <Table
      columns={columns.map((column) => {
        return {
          ...column,
          render: function renderPlaceholder() {
            return (
              <Skeleton
                active={active}
                className={className}
                key={column.key}
                paragraph={false}
                title
              />
            )
          },
        }
      })}
      dataSource={[...Array(rowCount)].map((_, index) => ({
        key: `key${index}`,
      }))}
      pagination={false}
      rowKey="key"
    />
  ) : (
    <>{children}</>
  )
}
