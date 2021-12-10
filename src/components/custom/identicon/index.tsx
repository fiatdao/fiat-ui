import s from './s.module.scss'
import React from 'react'
import cn from 'classnames'
import IdenticonJS from 'identicon.js'

export type IdenticonProps = {
  className?: string
  address?: string
  width?: number
  height?: number
  alt?: string
}

const EMPTY_ADDRESS = '000000000000000'

const Identicon: React.FC<IdenticonProps> = (props) => {
  const { address = EMPTY_ADDRESS, className, width = 32, height = 32, alt } = props

  const icon = React.useMemo<string>(() => {
    return new IdenticonJS(address, {
      format: 'svg',
    }).toString()
  }, [address])

  return (
    <img
      alt={alt ?? address}
      className={cn(s.component, className)}
      height={height}
      src={`data:image/svg+xml;base64,${icon}`}
      width={width}
    />
  )
}

export default Identicon
