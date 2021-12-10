import s from './s.module.scss'
import React from 'react'
import cn from 'classnames'

export type StatusTagProps = {
  color: 'red' | 'green' | 'blue' | 'purple'
  className?: string
}

const StatusDot: React.FC<StatusTagProps> = (props) => {
  const { className, color } = props

  return <div className={cn(s.statusDot, s[color], className)} />
}

export default StatusDot
