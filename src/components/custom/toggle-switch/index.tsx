import s from './s.module.scss'
import cn from 'classnames'
import { Switch, SwitchProps } from 'antd'

export type ToggleSwitchProps = {
  label?: string
} & SwitchProps

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  className,
  label,
  onChange,
  ...restProps
}) => {
  return (
    <div className={cn(s.component, className)}>
      {label && <span className={s.label}>{label}</span>}
      <Switch checked={checked} className={cn(s.switch)} onChange={onChange} {...restProps} />
    </div>
  )
}

export default ToggleSwitch
