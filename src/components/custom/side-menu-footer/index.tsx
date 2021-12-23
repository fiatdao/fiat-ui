import s from './s.module.scss'
import cn from 'classnames'
import { HTMLAttributes } from 'react'
import ButtonOutline from '@/src/components/antd/button-outline'
import FiatDaoIcon from '@/src/resources/svg/fiat-dao-icon.svg'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'
import ExternalLink from '@/src/resources/svg/external-link.svg'

export const SideMenuFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...restProps
}) => {
  const handleAddProjectToken = () => {
    // TODO: add project token
  }

  return (
    <div className={cn(s.sideMenuFooter, className)} {...restProps}>
      <ul className={cn(s.links)}>
        <li className={cn(s.item)}>
          <a className={cn(s.link)} href="https://google.com" title="Buy and sell on Matcha">
            Buy and sell on Matcha <ExternalLink />
          </a>
        </li>
        <li className={cn(s.item)}>
          <a className={cn(s.link)} href="https://google.com" title="Borrow and lend on Rari Fuse">
            Borrow and lend on Rari Fuse <ExternalLink />
          </a>
        </li>
        <li className={cn(s.item)}>
          <a className={cn(s.link)} href="https://google.com" title="FIAT's Dune Dashboard">
            FIAT's Dune Dashboard <ExternalLink />
          </a>
        </li>
      </ul>
      <h5 className={cn(s.title)}>ADD TO WALLET</h5>
      <div className={cn(s.buttons)}>
        <ButtonOutline height="lg" onClick={handleAddProjectToken}>
          <FiatIcon /> FIAT
        </ButtonOutline>
        <ButtonOutline height="lg" onClick={handleAddProjectToken}>
          <FiatDaoIcon /> FDT
        </ButtonOutline>
      </div>
    </div>
  )
}
