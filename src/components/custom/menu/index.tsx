/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import s from './s.module.scss'
import SafeSuspense from '@/src/components/custom/safe-suspense'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { usePositionsBadge } from '@/src/hooks/usePositionsBadge'
import { RouteItem, routes } from '@/src/constants/navigation'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import cn from 'classnames'

interface Props {
  className?: string
  onClick?: () => void
}

const PositionsBadge = () => {
  const userPositions = usePositionsBadge()

  return (
    <span className={cn(s.badge)}>
      <span className={cn(s.badgeInner)}>
        <span className={cn(s.badgeBackground)}>{userPositions}</span>
      </span>
    </span>
  )
}

export const Menu: React.FC<Props> = ({ className, onClick, ...restProps }: Props) => {
  const { pathname } = useRouter()
  const [selectedItem, setSelectedItem] = useState<RouteItem>()
  const { address, isWalletConnected } = useWeb3Connection()
  const isConnected = isWalletConnected && address

  useEffect(() => {
    const currentItem = [...routes].reverse().find(({ to }) => pathname.startsWith(to))
    setSelectedItem(currentItem ?? undefined)
  }, [pathname, setSelectedItem])

  return (
    <div className={cn(s.menu, className)} onClick={onClick} {...restProps}>
      {routes.map(({ badge, icon, iconActive, key, title, to }, index) => (
        <Link href={to} key={`${index}_${key}`} passHref>
          <a className={cn(s.item, { [s.isActive]: selectedItem?.key === key })}>
            <img
              alt={title}
              className={cn(s.icon)}
              src={`data:image/svg+xml;base64,${selectedItem?.key === key ? iconActive : icon}`}
            />
            <span className={cn(s.title)}>{title}</span>
            {badge && isConnected && (
              <SafeSuspense>
                <PositionsBadge />
              </SafeSuspense>
            )}
          </a>
        </Link>
      ))}
    </div>
  )
}
