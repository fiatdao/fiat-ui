import s from './s.module.scss'
import cn from 'classnames'
import { Checkbox, CheckboxProps } from 'antd'

export type ToggleSwitchProps = {
  className?: string
  label?: string
} & CheckboxProps

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, label, onChange }) => {
  return (
    <Checkbox checked={checked} className={cn(s.component)} onChange={onChange}>
      {label}
    </Checkbox>
  )
}

export default ToggleSwitch
