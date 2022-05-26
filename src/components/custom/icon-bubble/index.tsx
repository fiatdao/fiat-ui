import Sprite from '@/src/resources/svg/icons-sprite.svg'
import React, { CSSProperties } from 'react'

export type IconBubbleProps = {
  name?: string
  bubbleName?: string
  secondBubbleName?: string
  width?: number
  height?: number
  className?: string
  style?: CSSProperties
}

let uuid = 0

const IconBubble: React.FC<IconBubbleProps> = (props) => {
  uuid += 1

  const { bubbleName, className, height, name, secondBubbleName, style, width = 40 } = props
  const id = `ib-${uuid}`

  if (!name) {
    return null
  }

  return (
    <svg className={className} height={height ?? width} style={style} width={width}>
      <mask id={id}>
        <circle cx="50%" cy="50%" fill="white" r="50%" />
        {bubbleName && <circle cx="77.5%" cy="22.5%" fill="black" r="25%" />}
        {secondBubbleName && <circle cx="77.5%" cy="77.5%" fill="black" r="25%" />}
      </mask>
      <g mask={`url(#${id})`}>
        <use xlinkHref={`${Sprite}#icon__${name}`} />
      </g>
      {bubbleName && (
        <use height="45%" width="45%" x="55%" xlinkHref={`${Sprite}#icon__${bubbleName}`} y="0" />
      )}
      {secondBubbleName && (
        <use
          height="45%"
          width="45%"
          x="55%"
          xlinkHref={`${Sprite}#icon__${secondBubbleName}`}
          y="55%"
        />
      )}
    </svg>
  )
}

export default IconBubble
