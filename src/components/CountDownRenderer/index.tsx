import { CountdownRendererFn } from 'react-countdown'

export const RendererDHMS: CountdownRendererFn = ({ days, hours, minutes, seconds }) => {
  return (
    <span>
      {days}d {hours}h {minutes}m {seconds}s
    </span>
  )
}
