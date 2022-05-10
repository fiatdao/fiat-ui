import s from './s.module.scss'
import cn from 'classnames'
import Tooltip from '@/src/components/antd/tooltip'
import Grid from '@/src/components/custom/grid'
import Info from '@/src/resources/svg/info.svg'

export const SummaryItem: React.FC<{
  state?: 'ok' | 'warning' | 'danger' | undefined
  title: string
  titleTooltip?: string
  value: string
}> = ({ state, title, titleTooltip, value }) => (
  <div className={cn(s.row)}>
    <Grid align="center" flow="col" gap={4}>
      <div className={cn(s.title)}>{title}</div>
      {titleTooltip ? (
        <Tooltip title={titleTooltip}>
          <Info />
        </Tooltip>
      ) : (
        <></>
      )}
    </Grid>

    <div
      className={cn(
        s.value,
        { [s.ok]: state === 'ok' },
        { [s.warning]: state === 'warning' },
        { [s.danger]: state === 'danger' },
      )}
    >
      {value}
    </div>
  </div>
)

interface Props {
  className?: string
  data: any[]
}

export const Summary: React.FC<Props> = ({ className, data, ...restProps }) => (
  <div className={cn(s.component, className)} {...restProps}>
    {data.map((item, index) => (
      <SummaryItem key={index} {...item} />
    ))}
  </div>
)
