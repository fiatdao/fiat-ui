import s from './s.module.scss'
import React from 'react'
import cn from 'classnames'

export type ProgressProps = {
  colors: { bg: string; bar?: string; acceptance?: string }
  percent?: number
  acceptance?: number
  height?: number
  className?: string
  style?: React.CSSProperties
}

const ProgressNew: React.FC<ProgressProps> = (props) => {
  const { acceptance = 0, className, colors, height, percent = 0, style } = props

  return (
    <div
      className={cn(s.wrap, className)}
      style={
        {
          '--percent': percent ? `${percent}%` : '0%',
          '--height': height ? `${height}px` : '8px',
          '--bg-bar': colors.bar,
          '--bg-component': colors.bg,
          ...style,
        } as React.CSSProperties
      }
    >
      <div className={s.progress} />
      {acceptance ? (
        <div
          className={s.acceptance}
          style={
            {
              '--acceptance': `${acceptance}%`,
              '--acceptance-bg': colors.acceptance,
            } as React.CSSProperties
          }
        />
      ) : null}
    </div>
  )
}

export default ProgressNew
