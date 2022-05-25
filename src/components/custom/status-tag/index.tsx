import s from './s.module.scss'
import React from 'react'
import cn from 'classnames'
import { Text } from '@/src/components/custom/typography'

export type StatusTagProps = {
  text: React.ReactNode
  color: 'red' | 'green' | 'blue'
  className?: string
  style?: React.CSSProperties
}

const StatusTag: React.FC<StatusTagProps> = (props) => {
  const { className, color, style, text } = props

  return (
    <div className={cn(s.statusTag, className, s[color])} style={style}>
      <Text tag="label" type="lb2" weight="bold">
        {text}
      </Text>
    </div>
  )
}

export default StatusTag
