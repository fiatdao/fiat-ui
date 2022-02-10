import s from './s.module.scss'
import cn from 'classnames'
import { shortenAddr } from '@/src/web3/utils'
import { useWeb3Connection } from '@/src/providers/web3ConnectionProvider'
import { chainsConfig } from '@/src/constants/chains'

export const CellAddress: React.FC<{
  className?: string
  textAlign?: 'left' | 'right' | 'center'
  tooltip?: string
  value: string
}> = ({ className, textAlign, tooltip, value, ...restProps }) => {
  const { appChainId } = useWeb3Connection()
  const explorer =
    chainsConfig[appChainId].shortName === 'Goerli'
      ? 'https://goerli.etherscan.io/'
      : 'https://etherscan.io/'

  console.log(chainsConfig[appChainId].name)

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
