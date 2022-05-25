import s from './s.module.scss'
import { shortenAddr } from '@/src/web3/utils'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { getNetworkConfig } from '@/src/constants/chains'
import React from 'react'
import cn from 'classnames'

/// A block explorer link to a specific transaction.
/// Rendered in the "Transaction History" view
export const CellAddress: React.FC<{
  className?: string
  textAlign?: 'left' | 'right' | 'center'
  tooltip?: string
  value: string
}> = ({ className, textAlign, tooltip, value, ...restProps }) => {
  const { appChainId } = useWeb3Connection()
  const explorer = getNetworkConfig(appChainId)?.blockExplorerUrls[0]

  return (
    <div
      className={cn(
        s.component,
        { [s.left]: textAlign === 'left' },
        { [s.center]: textAlign === 'center' },
        { [s.right]: textAlign === 'right' },
        className,
      )}
      title={tooltip}
      {...restProps}
    >
      <a href={`${explorer}tx/${value}`} rel="noreferrer" target="_blank">
        {shortenAddr(value)}
      </a>
    </div>
  )
}
