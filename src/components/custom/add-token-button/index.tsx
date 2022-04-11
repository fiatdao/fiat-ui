import s from './s.module.scss'
import cn from 'classnames'
import React, { useEffect, useRef } from 'react'
import ButtonOutline from '@/src/components/antd/button-outline'
import useAddTokenToWallet from '@/src/hooks/useAddTokenToWallet'

enum Positions {
  'after',
  'before',
}

interface Props {
  onStatusChange?: (status: string) => void
  address: string
  symbol: string
  decimals: number
  image: string
  disabled?: boolean
  className?: string
  extraContent?: React.ReactNode
  extraContentPosition?: Positions
}

function usePrevious(value: any) {
  const ref = useRef()
  useEffect(() => {
    ref.current = value
  })
  return ref.current
}

export const AddTokenButton: React.FC<Props> = ({
  address,
  className,
  decimals,
  disabled,
  extraContent,
  extraContentPosition = 'before',
  image,
  onStatusChange,
  symbol,
}) => {
  const { addToken, status } = useAddTokenToWallet({
    address,
    symbol,
    decimals,
    image,
  })
  const prevStatus = usePrevious(status)

  useEffect(() => {
    if (prevStatus !== status && onStatusChange) onStatusChange(status)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, prevStatus])

  return (
    <ButtonOutline
      className={cn(s.component, className, { disabled })}
      disabled={disabled || status === 'pending'}
      height="lg"
      onClick={addToken}
    >
      <div>{extraContent && extraContentPosition === 'before' && extraContent}</div>
      <img alt={symbol} src={image} /> {symbol}
      <div>{extraContent && extraContentPosition === 'after' && extraContent}</div>
    </ButtonOutline>
  )
}
