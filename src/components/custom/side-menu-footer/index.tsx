import s from './s.module.scss'
import cn from 'classnames'
import { Button, Divider } from 'antd'
import { HTMLAttributes } from 'react'
import FiatDaoIcon from '@/src/resources/svg/fiat-dao-icon.svg'
import FiatIcon from '@/src/resources/svg/fiat-icon.svg'

export const SideMenuFooter: React.FC<HTMLAttributes<HTMLDivElement>> = ({
  className,
  ...restProps
}) => {
  const handleAddProjectToken = () => {
    // TODO: add project token
  }

  return (
    <div className={cn(s.sideMenuFooter, className)} {...restProps}>
      <div className="links">
        <p>
          <a href="https://google.com" title="Buy and sell on Matcha">
            Buy and sell on Matcha <span>icon</span>
          </a>
        </p>
        <p>
          <a href="https://google.com" title="Borrow and lend on Rari Fuse">
            Borrow and lend on Rari Fuse <span>icon</span>
          </a>
        </p>
        <p>
          <a href="https://google.com" title="FIAT's Dune Dashboard">
            FIAT's Dune Dashboard <span>icon</span>
          </a>
        </p>
      </div>
      <Divider />
      <div className="add-to-wallet">
        <p>ADD TO WALLET</p>
        <div className="buttons-container">
          <div>
            <Button onClick={handleAddProjectToken} type="primary">
              <FiatIcon /> FIAT
            </Button>
          </div>
          <div>
            <Button onClick={handleAddProjectToken} type="primary">
              <FiatDaoIcon /> FDT
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
