import s from './s.module.scss'
import React from 'react'
import BigNumber from 'bignumber.js'
import cn from 'classnames'

import { DropdownList } from '@/src/components/custom/dropdown'
import Icon, { TokenIconNames } from '@/src/components/custom/icon'
import { Slider } from '@/src/components/custom/slider'
import { Text } from '@/src/components/custom/typography'
import { KnownTokens, getTokenBySymbol } from '@/src/providers/knownTokensProvider'

type TokenAmountType = {
  value: string
  onChange: (value: string) => void
  before: React.ReactNode
  secondary?: React.ReactNode
  className?: string
  classNameBefore?: string
  placeholder?: string
  disabled?: boolean
  max?: BigNumber
  slider?: boolean
  decimals?: number
  name?: string
}

export const TokenAmount: React.FC<TokenAmountType> = ({
  before,
  className,
  classNameBefore,
  decimals = 6,
  max,
  name,
  onChange,
  secondary,
  slider,
  ...rest
}) => {
  const handlerKeyPress = (event: React.KeyboardEvent) => {
    let validChars = '1234567890'
    if (!rest.value.includes('.')) validChars += '.'

    if (!validChars.includes(event.key)) event.preventDefault()
  }

  return (
    <div className={className}>
      <div className={s.tokenAmount}>
        {before && (
          <div className={cn(s.tokenAmountBefore, classNameBefore)}>
            {before}
            <span className={s.tokenName}>{name}</span>
          </div>
        )}
        <div className={s.tokenAmountValues}>
          <input
            className={s.tokenAmountValue}
            inputMode="numeric"
            lang="en"
            onChange={(ev) => {
              onChange(ev.target.value)
            }}
            onKeyPress={handlerKeyPress}
            onWheel={(ev) => {
              ev.currentTarget.blur()
            }}
            pattern="[0-9]+([\.,][0-9]+)?"
            step={1 / 10 ** Math.min(decimals, 6)}
            type="text"
            {...rest}
          />
          <div className={s.tokenAmountHint}>{secondary}</div>
        </div>
        {max?.isFinite() && (
          <button
            className={cn('button-ghost', s.maxBtn)}
            disabled={rest.disabled || max.isEqualTo(BigNumber.ZERO)}
            onClick={() =>
              onChange(
                max.toFormat({
                  groupSeparator: '',
                  decimalSeparator: '.',
                }),
              )
            }
            style={{ alignSelf: 'center' }}
            type="button"
          >
            <span>Max</span>
          </button>
        )}
      </div>
      {slider && max?.isFinite() ? (
        <Slider
          className={s.tokenAmountSlider}
          disabled={rest.disabled || max?.isEqualTo(BigNumber.ZERO)}
          max={max?.toNumber()}
          min="0"
          onChange={(e) => {
            onChange(e.target.value)
          }}
          step={1 / 10 ** Math.min(decimals ?? 6, 6)}
          type="range"
          value={Number(rest.value) || 0}
        />
      ) : null}
    </div>
  )
}

type TokenAmountPreviewType = {
  value: React.ReactNode
  before: React.ReactNode
  secondary?: React.ReactNode
  className?: string
}

export const TokenAmountPreview: React.FC<TokenAmountPreviewType> = ({
  before,
  className,
  secondary,
  value,
}) => {
  return (
    <div className={cn(s.tokenAmountPreview, className)}>
      {before && <div className={s.tokenAmountPreviewBefore}>{before}</div>}
      <div className={s.tokenAmountPreviewValues}>
        <div className={s.tokenAmountPreviewValue}>{value}</div>
        <div className={s.tokenAmountPreviewHint}>{secondary}</div>
      </div>
    </div>
  )
}

type TokenSelectType = {
  value: KnownTokens
  onChange: (value: KnownTokens) => void
  tokens: KnownTokens[]
}

export const TokenSelect: React.FC<TokenSelectType> = ({ onChange, tokens, value }) => {
  const foundToken = getTokenBySymbol(value)

  return (
    <DropdownList
      items={tokens.reduce((acc: React.ButtonHTMLAttributes<HTMLButtonElement>[], token) => {
        const found = getTokenBySymbol(token)
        if (!found) return acc
        return [
          ...acc,
          {
            onClick: () => {
              onChange(token as KnownTokens)
            },
            children: (
              <>
                <Icon className="mr-8" name={getTokenBySymbol(token)?.icon as TokenIconNames} />
                {getTokenBySymbol(token)?.name}
              </>
            ),
            'aria-selected': foundToken?.symbol === found.symbol ? 'true' : 'false',
          },
        ]
      }, [])}
    >
      {({ open, ref, setOpen }) => (
        <button
          className="token-amount-select-token"
          onClick={() => setOpen((isOpen) => !isOpen)}
          ref={ref}
          type="button"
        >
          {foundToken ? (
            <Icon
              className="mr-16"
              height={24}
              name={foundToken.icon as TokenIconNames}
              width={24}
            />
          ) : null}
          <Text color="primary" type="p1" weight="semibold">
            {foundToken?.symbol}
          </Text>
          <Icon
            className="token-select-chevron"
            height="24"
            name="dropdown"
            style={{
              marginLeft: 4,
              transform: open ? 'rotate(180deg)' : '',
            }}
            width="24"
          />
        </button>
      )}
    </DropdownList>
  )
}
