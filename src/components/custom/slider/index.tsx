import s from './s.module.scss'
import React from 'react'
import cn from 'classnames'

type Props = React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>

// TODO: review current implementation as `step`, `type`, and `rest` props are not used
export const Slider: React.FC<Props> = ({
  className,
  disabled,
  max,
  min,
  onChange,
  value,
  ...rest
}) => {
  const _max = Number(max) || 0
  const slicedMax = Math.floor(_max * 1e6) / 1e6
  const slicedValue = Math.floor(Number(value) * 1e6) / 1e6
  const percent = (slicedValue / slicedMax) * 100 || 0
  const _disabled = slicedMax === 0

  return (
    <input
      className={cn(s.input, className)}
      disabled={_disabled}
      max={_disabled ? 1 : slicedMax}
      min={min}
      onChange={onChange}
      style={{ '--track-fill': `${!_disabled ? percent : 0}%` } as React.CSSProperties}
      type="range"
      value={!disabled ? value || '0' : '0'}
      {...rest}
    />
  )
}
