import s from './s.module.scss'
import React from 'react'
import { LoadingOutlined } from '@ant-design/icons'
import AntdSpin, { SpinProps as AntdSpinProps } from 'antd/lib/spin'
import cn from 'classnames'

type Props = AntdSpinProps & {
  type?: 'default' | 'circle'
}

const Spin: React.FC<Props> = (props) => {
  const { className, type = 'default', ...spinProps } = props

  const indicator = React.useMemo(() => {
    switch (type) {
      case 'circle':
        return <LoadingOutlined spin />
      default:
        break
    }

    return undefined
  }, [type])

  return <AntdSpin className={cn(s.spin, className)} indicator={indicator} {...spinProps} />
}

export default Spin
