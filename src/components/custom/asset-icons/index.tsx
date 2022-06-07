import s from './s.module.scss'
import cn from 'classnames'

export const AssetIcons: React.FC<{
  className?: string
  dimensions?: string
  mainAsset?: string
}> = ({ className, dimensions, mainAsset, ...restProps }) => {
  return (
    <div
      className={cn(s.component, className)}
      style={dimensions ? { width: dimensions, height: dimensions } : undefined}
      {...restProps}
    >
      <div className={cn(s.mainAsset)}>
        <img
          alt={mainAsset}
          src={mainAsset}
          style={dimensions ? { width: dimensions, height: dimensions } : undefined}
        />
      </div>
    </div>
  )
}
