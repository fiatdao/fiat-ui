import React, { Children } from 'react'
import { useRouter } from 'next/router'
import cx from 'classnames'
import Link, { LinkProps } from 'next/link'

export type NavLinkProps = React.PropsWithChildren<LinkProps> & {
  activeClassName?: string
  className?: string
}

const NavLink = ({ activeClassName = 'active', children, className, ...props }: NavLinkProps) => {
  const { asPath } = useRouter()
  const child = Children.only(children) as React.ReactElement
  const childClassName = child.props.className || ''

  const isActive = asPath === props.href || asPath === props.as

  const _className = cx(childClassName, { [activeClassName]: isActive }, className)

  return (
    <Link {...props}>
      {React.cloneElement(child, {
        className: _className || null,
      })}
    </Link>
  )
}

export default NavLink
