import s from './s.module.scss'
import React from 'react'
import cn from 'classnames'

import Icon from '@/src/components/custom/icon'
import { Tooltip } from '@/src/components/custom/tooltip'

export type TextProps = {
  tag?:
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'label'
    | 'p'
    | 'div'
    | 'span'
    | 'small'
    | 'strong'
  type: 'h1' | 'h2' | 'h3' | 'p1' | 'p2' | 'p3' | 'lb1' | 'lb2' | 'small'
  weight?: '500' | '700' | 'semibold' | 'bold'
  color?: 'primary' | 'secondary' | 'red' | 'green' | 'blue' | 'purple' | 'white' | string
  textGradient?: string
  align?: 'left' | 'center' | 'right'
  ellipsis?: boolean
  wrap?: boolean
  className?: string
  style?: Partial<CSSStyleDeclaration>
  title?: string
  font?: 'secondary' | 'tertiary'
}

// eslint-disable-next-line react/display-name
export const Text: React.FC<TextProps> = React.memo((props) => {
  const {
    align,
    children,
    className,
    color,
    ellipsis,
    font,
    style,
    tag = 'div',
    textGradient,
    type,
    weight,
    wrap,
    ...textProps
  } = props

  return React.createElement(
    tag,
    {
      className: cn(
        s.text,
        s[type],
        weight && s[`weight-${weight}`],
        color && s[`${color}-color`],
        align && `text-${align}`,
        ellipsis && 'text-ellipsis',
        textGradient && s.textGradient,
        wrap === true && 'text-wrap',
        wrap === false && 'text-nowrap',
        font && s[`font-${font}`],
        className,
      ),
      style: textGradient
        ? { ...style, '--text-gradient': textGradient || '', '--text-color': color }
        : style,
      ...textProps,
    },
    children,
  )
})

export type HintProps = {
  text: React.ReactNode
  className?: string
}

export const Hint: React.FC<HintProps> = (props) => {
  const { children, className, text } = props

  if (!text) {
    return <>{children}</>
  }

  return (
    <div className={cn(s.hint, className)}>
      <span>{children}</span>
      <Tooltip
        className={s.tooltip}
        target={<Icon className={s.icon} height={16} name="info-outlined" width={16} />}
      >
        {text}
      </Tooltip>
    </div>
  )
}
