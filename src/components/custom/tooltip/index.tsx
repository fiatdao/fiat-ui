import s from './s.module.scss'
import { FC, ReactNode, useEffect, useRef, useState } from 'react'
import { usePopper } from 'react-popper'
import cn from 'classnames'

type TooltipProps = {
  children: ReactNode
  target: ReactNode
  placement?: 'top' | 'bottom'
  title?: string | undefined
  className?: string
}

export const Tooltip: FC<TooltipProps> = (props) => {
  const { children, className, placement = 'bottom', target, title } = props
  const [showTooltip, setShowTooltip] = useState(false)
  const targetRef = useRef(null)
  const popperRef = useRef(null)
  const arrowRef = useRef(null)

  const { attributes, forceUpdate, state, styles } = usePopper(
    targetRef.current,
    popperRef.current,
    {
      placement,
      strategy: 'absolute',
      modifiers: [
        { name: 'arrow', options: { element: arrowRef.current } },
        { name: 'preventOverflow', options: { padding: 8 } },
      ],
    },
  )

  useEffect(() => {
    if (showTooltip && forceUpdate) {
      forceUpdate()
    }
  }, [showTooltip, forceUpdate])

  const handlerShow = () => {
    setShowTooltip(true)
  }

  const handlerHide = () => {
    setShowTooltip(false)
  }

  return (
    <div
      onBlur={handlerHide}
      onFocus={handlerShow}
      onMouseEnter={handlerShow}
      onMouseLeave={handlerHide}
      ref={targetRef}
      style={{ display: 'inline-flex' }}
      // tabIndex={0}
    >
      {target}
      <div
        className={cn(s.popper, className, { [s.hide]: !showTooltip })}
        ref={popperRef}
        style={styles.popper}
        // tabIndex={showTooltip ? 0 : -1}
        {...attributes.popper}
      >
        <div className={s.tooltip}>
          {title && <div className={s.title}>{title}</div>}
          {children}
          <div
            className={s.arrow}
            data-placement={state?.placement}
            ref={arrowRef}
            style={styles.arrow}
          />
        </div>
      </div>
    </div>
  )
}
