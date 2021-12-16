import s from './s.module.scss'
import React from 'react'
import AntdSkeleton, { SkeletonProps as AntdSkeletonProps } from 'antd/lib/skeleton'
import cn from 'classnames'

export type SkeletonProps = AntdSkeletonProps & {
  width?: number
  height?: number
}

const Skeleton: React.FC<SkeletonProps> = (props) => {
  const { children, className, height, loading, width, ...skeletonProps } = props

  return (
    <AntdSkeleton
      active
      className={cn(s.skeleton, className)}
      loading={loading !== false}
      paragraph={{ rows: 0 }}
      title={{ width, style: { height } }}
      {...skeletonProps}
    >
      {children}
    </AntdSkeleton>
  )
}

export default Skeleton
