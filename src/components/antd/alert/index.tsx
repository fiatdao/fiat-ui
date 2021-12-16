import s from './s.module.scss'
import Icon from '../../custom/icon'
import React from 'react'
import AntdAlert, { AlertProps as AntdAlertProps } from 'antd/lib/alert'
import cn from 'classnames'

export type AlertProps = AntdAlertProps

const Alert: React.FC<AlertProps> = (props) => {
  const { children, className, type = 'info', ...alertProps } = props

  const icon = React.useMemo<React.ReactNode>(() => {
    switch (type) {
      case 'info':
        return <Icon name="info-outlined" />
      default:
        return undefined
    }
  }, [type])

  return (
    <AntdAlert
      className={cn(s.component, className)}
      icon={icon}
      showIcon
      type={type}
      {...alertProps}
    />
  )
}

export default Alert
