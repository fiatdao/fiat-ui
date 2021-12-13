import s from './s.module.scss'
import { NavLink } from '../../navigation/NavLink'
import React, { HTMLProps, ReactNode } from 'react'
import ReactDOM from 'react-dom'
import { Modifier, usePopper } from 'react-popper'
import { LinkProps } from 'next/link'
import * as PopperJS from '@popperjs/core'
import { ModifierPhases } from '@popperjs/core'
import outy from 'outy'

const modifiers: readonly Partial<Modifier<string>>[] = [
  { name: 'offset', options: { offset: [0, 8] } },
  {
    name: 'sameWidth',
    enabled: true,
    phase: 'beforeWrite' as ModifierPhases,
    requires: ['computeStyles'],
    fn({ state }) {
      state.styles.popper.minWidth = `${state.rects.reference.width}px`
    },
    effect({ state }) {
      // @ts-ignore
      state.elements.popper.style.minWidth = `${state.elements.reference.offsetWidth}px`
    },
  },
]

export type DropdownProps = {
  content: (setOpen: React.Dispatch<React.SetStateAction<boolean>>) => React.ReactNode
  options?: Partial<PopperJS.Options>
  children: ({
    open,
    ref,
    setOpen,
  }: {
    ref: React.MutableRefObject<null>
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    open: boolean
  }) => void
}

export const Dropdown: React.FC<DropdownProps> = ({ children, content, options }) => {
  const [open, setOpen] = React.useState(false)
  const referenceElement = React.useRef(null)
  const popperElement = React.useRef(null)

  const { attributes, forceUpdate, styles } = usePopper(
    referenceElement.current,
    popperElement.current,
    {
      placement: 'bottom-start',
      strategy: 'absolute',
      modifiers,
      ...options,
    },
  )

  React.useEffect(() => {
    let outyInstance: ReturnType<typeof outy>
    if (forceUpdate) {
      forceUpdate()
    }

    if (open) {
      const nodes: HTMLElement[] = []

      const referenceWrapEl = referenceElement.current
      if (referenceWrapEl) {
        nodes.push(referenceWrapEl)
      }
      const popperEl = popperElement.current
      if (popperEl) {
        nodes.push(popperEl)
      }
      outyInstance = outy(
        nodes,
        ['click' as unknown as MouseEvent, 'touchstart' as unknown as TouchEvent],
        () => setOpen(false),
      )
    }

    return () => {
      outyInstance?.remove()
    }
  }, [forceUpdate, open])

  return (
    <>
      {children({ ref: referenceElement, setOpen, open })}
      {ReactDOM.createPortal(
        <div
          ref={popperElement}
          style={{
            ...styles.popper,
            // visibility: open ? 'visible' : 'hidden',
            display: open ? '' : 'none',
          }}
          {...attributes.popper}
        >
          {content(setOpen)}
        </div>,
        document.querySelector('#tooltip-root') || document.body,
      )}
    </>
  )
}

type LinkProps2 = LinkProps & { children: ReactNode }
export type DropdownListProps = {
  items: (HTMLProps<HTMLButtonElement> | HTMLProps<HTMLLinkElement> | LinkProps2)[]
  options?: Partial<PopperJS.Options>
  children: ({
    open,
    ref,
    setOpen,
  }: {
    ref: React.MutableRefObject<null>
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    open: boolean
  }) => void
}

export const DropdownList: React.FC<DropdownListProps> = ({ children, items, options }) => {
  return (
    <Dropdown
      content={(setOpen) => (
        <ul className={s.tokenSelectList}>
          {items.map(({ children, href, ...rest }, idx) => {
            if (href) {
              return (
                <li key={idx}>
                  {/**
                   @ts-ignore */}
                  <NavLink
                    href={href.toString()}
                    {...rest}
                    className={s.tokenSelectListButton}
                    onClick={() => {
                      // if (onClick) onClick(e);
                      setOpen(false)
                    }}
                  >
                    {children}
                  </NavLink>
                </li>
              )
            }

            // @ts-ignore
            if (rest.to) {
              return (
                <li key={idx}>
                  {/**
                   @ts-ignore */}
                  <NavLink
                    {...rest}
                    className={s.tokenSelectListButton}
                    onClick={() => {
                      // if (onClick) onClick(e);
                      setOpen(false)
                    }}
                  />
                </li>
              )
            }

            return (
              <li key={idx}>
                {/**
                 @ts-ignore */}
                <button
                  {...rest}
                  className={s.tokenSelectListButton}
                  onClick={(e) => {
                    // @ts-ignore
                    if (onClick) onClick(e)
                    setOpen(false)
                  }}
                />
              </li>
            )
          })}
        </ul>
      )}
      options={options}
    >
      {children}
    </Dropdown>
  )
}
