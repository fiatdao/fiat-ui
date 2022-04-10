import s from './s.module.scss'
import Input from '@/src/components/antd/input'
import Identicon from '@/src/components/custom/identicon'
import React from 'react'
import { InputProps as AntdInputProps } from 'antd/lib/input/Input'
import cn from 'classnames'
import { isAddress } from 'web3-utils'

export type TokenInputProps = AntdInputProps

const TokenInput: React.FC<TokenInputProps> = (props) => {
  const { className, value, ...inputProps } = props

  const addonBefore = React.useMemo(
    () =>
      isAddress(String(value)) ? (
        <Identicon address={String(value)} height={24} width={24} />
      ) : (
        <div />
      ),
    [value],
  )

  return (
    <Input
      addonBefore={addonBefore}
      className={cn(s.component, className)}
      size="large"
      value={value}
      {...inputProps}
    />
  )
}

export default TokenInput
